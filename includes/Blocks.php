<?php

namespace Outstand\WP\Carousel;

defined( 'ABSPATH' ) || exit;

use WP_Block;

class Blocks extends BaseModule {

	/**
	 * Context key holding the media of every slide, for the blocks inside a carousel.
	 *
	 * @var string
	 */
	const SLIDES_CONTEXT = 'outstand/carousel/slides';

	/**
	 * {@inheritDoc}
	 */
	public function register(): void {
		add_action( 'init', [ $this, 'register_blocks' ] );
		add_filter( 'render_block_context', [ $this, 'add_slides_context' ], 10, 3 );
	}

	/**
	 * Registers every built block and its editor script translations.
	 *
	 * @return void
	 */
	public function register_blocks(): void {
		$metadata_files = glob( OUTSTAND_CAROUSEL_DIST_PATH . 'blocks/*/block.json' );

		foreach ( $metadata_files ?: [] as $metadata_file ) {
			$block_type = register_block_type_from_metadata( dirname( $metadata_file ) );

			if ( ! $block_type ) {
				continue;
			}

			foreach ( $block_type->editor_script_handles as $handle ) {
				wp_set_script_translations( $handle, 'outstand-carousel', OUTSTAND_CAROUSEL_PATH . 'languages' );
			}
		}
	}

	/**
	 * Gives the direct children of a carousel the media of every slide.
	 *
	 * The context flows down to nested blocks, so a pagination block inside a
	 * group still receives it.
	 *
	 * @param  array         $context      Block context.
	 * @param  array         $parsed_block Block being rendered.
	 * @param  WP_Block|null $parent_block Parent block instance.
	 * @return array
	 */
	public function add_slides_context( $context, $parsed_block, $parent_block ): array { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundInExtendedClassBeforeLastUsed -- required by filter signature.
		$context = (array) $context;

		if ( ! $parent_block instanceof WP_Block || 'outstand/carousel' !== $parent_block->name ) {
			return $context;
		}

		$context[ self::SLIDES_CONTEXT ] = array_map(
			[ Slides::class, 'get_media_id' ],
			Slides::find( $parent_block->parsed_block )
		);

		return $context;
	}
}
