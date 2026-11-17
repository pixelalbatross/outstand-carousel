<?php

namespace Outstand\WP\Carousel\CLI;

defined( 'ABSPATH' ) || exit;

use Outstand\WP\Carousel\BaseModule;
use Outstand\WP\Carousel\LegacyConverter;
use WP_CLI;
use WP_Post;

/**
 * Converts Slider Block (`pixelalbatross/slider`) content to Outstand Carousel blocks.
 */
class MigrateCommand extends BaseModule {

	/**
	 * Number of posts loaded between two runtime cache flushes.
	 *
	 * @var int
	 */
	const BATCH_SIZE = 100;

	/**
	 * Option that holds the block widget instances.
	 *
	 * @var string
	 */
	const WIDGET_OPTION = 'widget_block';

	/**
	 * Row result: the content was converted, or would be converted in a dry run.
	 *
	 * @var string
	 */
	const RESULT_CONVERTED = 'converted';

	/**
	 * Row result: the content was left as it is.
	 *
	 * @var string
	 */
	const RESULT_SKIPPED = 'skipped';

	/**
	 * Row result: the save failed.
	 *
	 * @var string
	 */
	const RESULT_FAILED = 'failed';

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
	 * Checks the posts of every post type and status except revisions, including
	 * templates, template parts and synced patterns, and the block widgets.
	 * WordPress saves a revision of each changed post when its post type supports
	 * revisions. Templates stored as theme files are not checked.
	 *
	 * A scheduled post whose date has passed is skipped, because saving it would
	 * publish it.
	 *
	 * On multisite, run the command once for each site with `--url=<site>`.
	 *
	 * ## OPTIONS
	 *
	 * [--dry-run]
	 * : List what would change without saving.
	 *
	 * [--post_type[=<post_types>]]
	 * : Comma-separated post types to check. Default: all. Block widgets are always checked.
	 *
	 * [--include[=<ids>]]
	 * : Comma-separated post IDs to check. Block widgets are always checked.
	 *
	 * ## EXAMPLES
	 *
	 *     # List what would change.
	 *     wp outstand-carousel migrate --dry-run
	 *
	 *     # Convert the pages and the templates.
	 *     wp outstand-carousel migrate --post_type=page,wp_template
	 *
	 *     # Convert two posts.
	 *     wp outstand-carousel migrate --include=12,34
	 *
	 *     # Convert every site of a multisite network.
	 *     wp site list --field=url | xargs -I % wp outstand-carousel migrate --url=%
	 *
	 * @param  array $args       Positional arguments.
	 * @param  array $assoc_args Associative arguments.
	 * @return void
	 */
	public function migrate( array $args, array $assoc_args ): void { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundBeforeLastUsed -- required by the command signature.
		$dry_run     = (bool) WP_CLI\Utils\get_flag_value( $assoc_args, 'dry-run', false );
		$post_types  = $this->get_post_types( $assoc_args );
		$include_ids = $this->get_include_ids( $assoc_args );
		$post_ids    = $this->find_posts( $post_types, $include_ids );

		// Content is converted as is; kses would strip markup authors were allowed to save.
		kses_remove_filters();

		$rows = [];

		foreach ( array_chunk( $post_ids, self::BATCH_SIZE ) as $chunk ) {
			foreach ( $chunk as $post_id ) {
				$row = $this->migrate_post( $post_id, $dry_run );

				if ( null !== $row ) {
					$rows[] = $row;
				}
			}

			// Frees the posts the chunk loaded into the in-memory cache.
			if ( wp_cache_supports( 'flush_runtime' ) ) {
				wp_cache_flush_runtime();
			}
		}

		$rows = array_merge( $rows, $this->migrate_widgets( $dry_run ) );

		if ( ! $rows ) {
			WP_CLI::success( __( 'No Slider Block sliders found.', 'outstand-carousel' ) );
			return;
		}

		WP_CLI\Utils\format_items( 'table', $rows, [ 'ID', 'type', 'title', 'sliders', 'status', 'notes' ] );

		$this->report( $rows, $dry_run );
	}

	/**
	 * Reads and validates the `--post_type` option.
	 *
	 * @param  array $assoc_args Associative arguments.
	 * @return string[] Post types, or an empty array for all post types.
	 */
	private function get_post_types( array $assoc_args ): array {
		if ( ! array_key_exists( 'post_type', $assoc_args ) ) {
			return [];
		}

		$value      = $assoc_args['post_type'];
		$post_types = is_string( $value ) ? array_filter( array_map( 'trim', explode( ',', $value ) ) ) : [];

		if ( ! $post_types ) {
			WP_CLI::error( __( 'The --post_type option needs at least one post type.', 'outstand-carousel' ) );
		}

		foreach ( $post_types as $post_type ) {
			if ( ! post_type_exists( $post_type ) ) {
				/* translators: %s: post type name. */
				WP_CLI::error( sprintf( __( 'The "%s" post type does not exist.', 'outstand-carousel' ), $post_type ) );
			}
		}

		return array_values( array_unique( $post_types ) );
	}

	/**
	 * Reads and validates the `--include` option.
	 *
	 * @param  array $assoc_args Associative arguments.
	 * @return int[] Post IDs, or an empty array for all posts.
	 */
	private function get_include_ids( array $assoc_args ): array {
		if ( ! array_key_exists( 'include', $assoc_args ) ) {
			return [];
		}

		$value    = $assoc_args['include'];
		$post_ids = [];

		foreach ( is_string( $value ) ? explode( ',', $value ) : [] as $id ) {
			$post_id = filter_var( trim( $id ), FILTER_VALIDATE_INT, [ 'options' => [ 'min_range' => 1 ] ] );

			if ( false !== $post_id ) {
				$post_ids[] = $post_id;
			}
		}

		if ( ! $post_ids ) {
			WP_CLI::error( __( 'The --include option needs at least one post ID.', 'outstand-carousel' ) );
		}

		return array_values( array_unique( $post_ids ) );
	}

	/**
	 * Finds the posts whose content has a Slider Block slider.
	 *
	 * @param  string[] $post_types  Post types to check, or an empty array for all.
	 * @param  int[]    $include_ids Post IDs to check, or an empty array for all.
	 * @return int[]
	 */
	private function find_posts( array $post_types, array $include_ids ): array {
		global $wpdb;

		$where  = [ "post_type <> 'revision'", 'post_content LIKE %s' ];
		$values = [ '%' . $wpdb->esc_like( $this->get_search_string() ) . '%' ];

		if ( $post_types ) {
			$where[] = 'post_type IN (' . implode( ',', array_fill( 0, count( $post_types ), '%s' ) ) . ')';
			$values  = array_merge( $values, $post_types );
		}

		if ( $include_ids ) {
			$where[] = 'ID IN (' . implode( ',', array_fill( 0, count( $include_ids ), '%d' ) ) . ')';
			$values  = array_merge( $values, $include_ids );
		}

		$sql = "SELECT ID FROM {$wpdb->posts} WHERE " . implode( ' AND ', $where ) . ' ORDER BY ID';

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared -- the placeholders are built above.
		$post_ids = $wpdb->get_col( $wpdb->prepare( $sql, $values ) );

		return array_map( 'absint', $post_ids );
	}

	/**
	 * Converts the sliders of one post.
	 *
	 * @param  int  $post_id Post ID.
	 * @param  bool $dry_run Whether to leave the post unchanged.
	 * @return array|null Table row, or null when the post has nothing to convert.
	 */
	private function migrate_post( int $post_id, bool $dry_run ): ?array {
		$post = get_post( $post_id );

		if ( ! $post instanceof WP_Post ) {
			return null;
		}

		$notes  = [];
		$count  = 0;
		$blocks = LegacyConverter::convert_blocks( parse_blocks( $post->post_content ), $notes, $count );

		if ( 0 === $count ) {
			return null;
		}

		$row = [
			'ID'      => $post->ID,
			'type'    => $post->post_type,
			'title'   => $post->post_title,
			'sliders' => $count,
			'result'  => self::RESULT_CONVERTED,
			'status'  => $dry_run ? __( 'would convert', 'outstand-carousel' ) : __( 'converted', 'outstand-carousel' ),
			'notes'   => $this->describe_notes( $notes ),
		];

		if ( $this->is_overdue( $post ) ) {
			$row['result'] = self::RESULT_SKIPPED;
			$row['status'] = __( 'skipped: the scheduled date has passed, and saving would publish the post', 'outstand-carousel' );

			return $row;
		}

		if ( $dry_run ) {
			return $row;
		}

		$result = wp_update_post(
			[
				'ID'           => $post->ID,
				'post_content' => wp_slash( serialize_blocks( $blocks ) ),
			],
			true
		);

		if ( is_wp_error( $result ) ) {
			$row['result'] = self::RESULT_FAILED;
			/* translators: %s: error message. */
			$row['status'] = sprintf( __( 'failed: %s', 'outstand-carousel' ), $result->get_error_message() );
		} elseif ( ! is_int( $result ) || $result < 1 ) {
			$row['result'] = self::RESULT_FAILED;
			$row['status'] = __( 'failed: the post was not saved', 'outstand-carousel' );
		}

		return $row;
	}

	/**
	 * Converts the sliders of the block widgets.
	 *
	 * @param  bool $dry_run Whether to leave the widgets unchanged.
	 * @return array[] Table rows, one for each widget with a slider.
	 */
	private function migrate_widgets( bool $dry_run ): array {
		$instances = get_option( self::WIDGET_OPTION, [] );

		if ( ! is_array( $instances ) ) {
			return [];
		}

		$rows = [];

		foreach ( $instances as $number => $instance ) {
			$content = is_array( $instance ) ? ( $instance['content'] ?? null ) : null;

			if ( ! is_string( $content ) || ! str_contains( $content, $this->get_search_string() ) ) {
				continue;
			}

			$notes  = [];
			$count  = 0;
			$blocks = LegacyConverter::convert_blocks( parse_blocks( $content ), $notes, $count );

			if ( 0 === $count ) {
				continue;
			}

			$instances[ $number ]['content'] = serialize_blocks( $blocks );

			$rows[] = [
				'ID'      => 'block-' . $number,
				'type'    => 'widget',
				'title'   => '',
				'sliders' => $count,
				'result'  => self::RESULT_CONVERTED,
				'status'  => $dry_run ? __( 'would convert', 'outstand-carousel' ) : __( 'converted', 'outstand-carousel' ),
				'notes'   => $this->describe_notes( $notes ),
			];
		}

		if ( ! $rows || $dry_run ) {
			return $rows;
		}

		$updated = update_option( self::WIDGET_OPTION, $instances );

		if ( true !== $updated ) {
			foreach ( $rows as $index => $row ) {
				$rows[ $index ]['result'] = self::RESULT_FAILED;
				$rows[ $index ]['status'] = __( 'failed: the widgets were not saved', 'outstand-carousel' );
			}
		}

		return $rows;
	}

	/**
	 * Whether a post is scheduled for a date that has passed.
	 *
	 * `wp_insert_post()` publishes a scheduled post when its date is less than a
	 * minute ahead, so this check uses the same rule.
	 *
	 * @param  WP_Post $post Post.
	 * @return bool
	 */
	private function is_overdue( WP_Post $post ): bool {
		if ( 'future' !== $post->post_status ) {
			return false;
		}

		$date_gmt = '0000-00-00 00:00:00' === $post->post_date_gmt ? get_gmt_from_date( $post->post_date ) : $post->post_date_gmt;
		$seconds  = strtotime( $date_gmt ) - strtotime( gmdate( 'Y-m-d H:i:s' ) );

		return $seconds < MINUTE_IN_SECONDS;
	}

	/**
	 * Prints the totals, and ends with an error when a save failed.
	 *
	 * @param  array[] $rows    Table rows.
	 * @param  bool    $dry_run Whether this is a dry run.
	 * @return void
	 */
	private function report( array $rows, bool $dry_run ): void {
		$sliders   = 0;
		$converted = 0;
		$skipped   = 0;
		$failed    = 0;

		foreach ( $rows as $row ) {
			switch ( $row['result'] ) {
				case self::RESULT_CONVERTED:
					$sliders += $row['sliders'];
					++$converted;
					break;

				case self::RESULT_SKIPPED:
					++$skipped;
					break;

				case self::RESULT_FAILED:
					++$failed;
					break;

				default:
					break;
			}
		}

		if ( $skipped > 0 ) {
			/* translators: %d: number of posts. */
			WP_CLI::warning( sprintf( __( '%d post(s) skipped. See the status column.', 'outstand-carousel' ), $skipped ) );
		}

		if ( $failed > 0 ) {
			/* translators: 1: number of sliders, 2: number of posts and widgets, 3: number of failed saves. */
			WP_CLI::error( sprintf( __( 'Converted %1$d slider(s) in %2$d post(s) and widget(s). %3$d save(s) failed. See the status column.', 'outstand-carousel' ), $sliders, $converted, $failed ) );
		}

		$message = $dry_run
			/* translators: 1: number of sliders, 2: number of posts and widgets. */
			? __( '%1$d slider(s) in %2$d post(s) and widget(s) would be converted. Run again without --dry-run to save.', 'outstand-carousel' )
			/* translators: 1: number of sliders, 2: number of posts and widgets. */
			: __( 'Converted %1$d slider(s) in %2$d post(s) and widget(s).', 'outstand-carousel' );

		WP_CLI::success( sprintf( $message, $sliders, $converted ) );
	}

	/**
	 * Describes the settings that have no equivalent.
	 *
	 * @param  string[] $notes Note codes from the converter.
	 * @return string
	 */
	private function describe_notes( array $notes ): string {
		return implode( '; ', array_map( [ $this, 'describe_note' ], array_unique( $notes ) ) );
	}

	/**
	 * Describes a setting that has no equivalent.
	 *
	 * @param  string $note Note code from the converter.
	 * @return string
	 */
	private function describe_note( string $note ): string {
		switch ( $note ) {
			case 'height':
				return __( 'slider height dropped, it had no visible effect', 'outstand-carousel' );
			case 'width':
				return __( 'slider width dropped, use the block width or alignment', 'outstand-carousel' );
			case 'paginationType':
				return __( 'pagination type replaced with dots', 'outstand-carousel' );
			default:
				return $note;
		}
	}

	/**
	 * Returns the start of the block comment that opens a Slider Block slider.
	 *
	 * The trailing space keeps other block names that start with
	 * `pixelalbatross/slider` out of the matches.
	 *
	 * @return string
	 */
	private function get_search_string(): string {
		return '<!-- wp:' . LegacyConverter::SLIDER . ' ';
	}
}
