<?php

namespace Outstand\WP\Carousel;

defined( 'ABSPATH' ) || exit;

use WP_Block_Type_Registry;

/**
 * Renders Slider Block (`pixelalbatross/slider`) sliders as Outstand Carousel blocks
 * when Slider Block is not active.
 *
 * WordPress fixes a block's name and block type when it creates the block instance.
 * The `render_block_data` filter runs before WordPress creates the instances of a
 * block's inner blocks, so this class converts Slider Block sliders there, one level
 * down. The converted sliders then render with their own block type, context,
 * interactivity directives, styles and view script module. The `pre_render_block`
 * filter renders any Slider Block slider that reaches rendering without conversion,
 * such as a top-level block.
 */
class LegacyRenderer extends BaseModule {

	/**
	 * {@inheritDoc}
	 */
	public function register(): void {
		add_filter( 'pre_render_block', [ $this, 'render_legacy_slider' ], 10, 2 );
		add_filter( 'render_block_data', [ $this, 'convert_inner_blocks' ] );
	}

	/**
	 * Renders a Slider Block slider as an Outstand Carousel block.
	 *
	 * @param  mixed $pre_render   The rendered content, or null to render the block.
	 * @param  mixed $parsed_block Parsed block.
	 * @return mixed
	 */
	public function render_legacy_slider( mixed $pre_render, mixed $parsed_block ): mixed {
		if ( null !== $pre_render || ! is_array( $parsed_block ) ) {
			return $pre_render;
		}

		if ( ! $this->is_legacy_slider( $parsed_block ) || $this->is_legacy_registered() ) {
			return $pre_render;
		}

		return render_block( LegacyConverter::convert_slider( $parsed_block ) );
	}

	/**
	 * Converts the Slider Block sliders among a block's inner blocks.
	 *
	 * @param  mixed $parsed_block Parsed block.
	 * @return mixed
	 */
	public function convert_inner_blocks( mixed $parsed_block ): mixed {
		if ( ! is_array( $parsed_block ) || empty( $parsed_block['innerBlocks'] ) || ! is_array( $parsed_block['innerBlocks'] ) ) {
			return $parsed_block;
		}

		$legacy_indexes = array_keys( array_filter( $parsed_block['innerBlocks'], fn( $inner_block ) => $this->is_legacy_slider( $inner_block ) ) );

		if ( ! $legacy_indexes || $this->is_legacy_registered() ) {
			return $parsed_block;
		}

		foreach ( $legacy_indexes as $index ) {
			$parsed_block['innerBlocks'][ $index ] = LegacyConverter::convert_slider( $parsed_block['innerBlocks'][ $index ] );
		}

		return $parsed_block;
	}

	/**
	 * Whether a parsed block is a Slider Block slider.
	 *
	 * @param  mixed $parsed_block Parsed block.
	 * @return bool
	 */
	private function is_legacy_slider( mixed $parsed_block ): bool {
		$block_name = is_array( $parsed_block ) ? ( $parsed_block['blockName'] ?? '' ) : '';

		return LegacyConverter::SLIDER === $block_name;
	}

	/**
	 * Whether Slider Block registers its slider block, so it renders its own blocks.
	 *
	 * @return bool
	 */
	private function is_legacy_registered(): bool {
		return WP_Block_Type_Registry::get_instance()->is_registered( LegacyConverter::SLIDER );
	}
}
