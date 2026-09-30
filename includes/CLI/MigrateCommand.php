<?php

namespace Outstand\WP\Carousel\CLI;

defined( 'ABSPATH' ) || exit;

use Outstand\WP\Carousel\BaseModule;
use Outstand\WP\Carousel\LegacyConverter;
use WP_CLI;

/**
 * Converts Slider Block (`pixelalbatross/slider`) content to Outstand Carousel blocks.
 */
class MigrateCommand extends BaseModule {

	/**
	 * {@inheritDoc}
	 */
	public function register(): void {
		WP_CLI::add_command( 'outstand-carousel migrate', [ $this, 'migrate' ] );
	}

	/**
	 * {@inheritDoc}
	 */
	public function can_register(): bool {
		return defined( 'WP_CLI' ) && WP_CLI;
	}

	/**
	 * Converts Slider Block sliders to Outstand Carousel blocks.
	 *
	 * Covers posts, pages, templates, template parts, synced patterns and any
	 * other post type stored in the database. Each change is saved as a new
	 * revision. Templates stored as theme files are not covered.
	 *
	 * ## OPTIONS
	 *
	 * [--dry-run]
	 * : List what would change without saving.
	 *
	 * [--post_type=<post_types>]
	 * : Comma-separated post types to convert. Default: all.
	 *
	 * [--include=<ids>]
	 * : Comma-separated post IDs to convert.
	 *
	 * ## EXAMPLES
	 *
	 *     wp outstand-carousel migrate --dry-run
	 *     wp outstand-carousel migrate --post_type=page,wp_template
	 *
	 * @param  array $args       Positional arguments.
	 * @param  array $assoc_args Associative arguments.
	 * @return void
	 */
	public function migrate( array $args, array $assoc_args ): void { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundBeforeLastUsed -- required by the command signature.
		$dry_run  = (bool) WP_CLI\Utils\get_flag_value( $assoc_args, 'dry-run', false );
		$post_ids = $this->find_posts( $assoc_args );

		if ( ! $post_ids ) {
			WP_CLI::success( __( 'No Slider Block sliders found.', 'outstand-carousel' ) );
			return;
		}

		// Content is converted as is; kses would strip markup authors were allowed to save.
		kses_remove_filters();

		$rows      = [];
		$converted = 0;

		foreach ( $post_ids as $post_id ) {
			$post = get_post( $post_id );

			if ( ! $post ) {
				continue;
			}

			$notes  = [];
			$count  = 0;
			$blocks = LegacyConverter::convert_blocks( parse_blocks( $post->post_content ), $notes, $count );

			if ( ! $count ) {
				continue;
			}

			$status = $dry_run ? __( 'would convert', 'outstand-carousel' ) : __( 'converted', 'outstand-carousel' );

			if ( ! $dry_run ) {
				$result = wp_update_post(
					[
						'ID'           => $post->ID,
						'post_content' => wp_slash( serialize_blocks( $blocks ) ),
					],
					true
				);

				if ( is_wp_error( $result ) ) {
					$status = $result->get_error_message();
				}
			}

			$converted += $count;

			$rows[] = [
				'ID'      => $post->ID,
				'type'    => $post->post_type,
				'title'   => $post->post_title,
				'sliders' => $count,
				'status'  => $status,
				'notes'   => implode( '; ', array_map( [ $this, 'describe_note' ], $notes ) ),
			];
		}

		WP_CLI\Utils\format_items( 'table', $rows, [ 'ID', 'type', 'title', 'sliders', 'status', 'notes' ] );

		$message = $dry_run
			/* translators: 1: number of sliders, 2: number of posts. */
			? __( '%1$d slider(s) in %2$d post(s) would be converted. Run again without --dry-run to save.', 'outstand-carousel' )
			/* translators: 1: number of sliders, 2: number of posts. */
			: __( 'Converted %1$d slider(s) in %2$d post(s).', 'outstand-carousel' );

		WP_CLI::success( sprintf( $message, $converted, count( $rows ) ) );
	}

	/**
	 * Finds the posts whose content has a legacy slider.
	 *
	 * @param  array $assoc_args Associative arguments.
	 * @return int[]
	 */
	private function find_posts( array $assoc_args ): array {
		global $wpdb;

		$where  = [ "post_type <> 'revision'", 'post_content LIKE %s' ];
		$values = [ '%' . $wpdb->esc_like( '<!-- wp:' . LegacyConverter::SLIDER . ' ' ) . '%' ];

		$post_types = array_filter( array_map( 'trim', explode( ',', (string) ( $assoc_args['post_type'] ?? '' ) ) ) );

		if ( $post_types ) {
			$where[] = 'post_type IN (' . implode( ',', array_fill( 0, count( $post_types ), '%s' ) ) . ')';
			$values  = array_merge( $values, $post_types );
		}

		$include = array_filter( array_map( 'absint', explode( ',', (string) ( $assoc_args['include'] ?? '' ) ) ) );

		if ( $include ) {
			$where[] = 'ID IN (' . implode( ',', array_fill( 0, count( $include ), '%d' ) ) . ')';
			$values  = array_merge( $values, $include );
		}

		$sql = "SELECT ID FROM {$wpdb->posts} WHERE " . implode( ' AND ', $where ) . ' ORDER BY ID';

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared -- the placeholders are built above.
		$post_ids = $wpdb->get_col( $wpdb->prepare( $sql, $values ) );

		return array_map( 'absint', $post_ids );
	}

	/**
	 * Describes a setting that has no equivalent.
	 *
	 * @param  string $note Note code from the converter.
	 * @return string
	 */
	private function describe_note( string $note ): string {
		switch ( $note ) {
			case 'width':
				return __( 'slider width dropped, use the block width or alignment', 'outstand-carousel' );
			case 'paginationType':
				return __( 'pagination type replaced with dots', 'outstand-carousel' );
			default:
				return $note;
		}
	}
}
