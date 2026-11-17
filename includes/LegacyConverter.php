<?php

namespace Outstand\WP\Carousel;

defined( 'ABSPATH' ) || exit;

/**
 * Converts Slider Block (`pixelalbatross/slider`) blocks to Outstand Carousel blocks.
 *
 * A Slider Block slider holds `pixelalbatross/slide` blocks, and each slide holds its
 * content as inner blocks. The slider settings are attributes of the slider block.
 *
 * `src/shared/legacy.js` converts the same input to the same block tree in the editor.
 * Both produce the results in `tests/fixtures/legacy-attributes.json` and
 * `tests/fixtures/legacy-blocks.json`.
 */
class LegacyConverter {

	/**
	 * Slider Block slider block name.
	 *
	 * @var string
	 */
	const SLIDER = 'pixelalbatross/slider';

	/**
	 * Slider Block slide block name.
	 *
	 * @var string
	 */
	const SLIDE = 'pixelalbatross/slide';

	/**
	 * Swiper's transition speed, used when the slider kept the default.
	 *
	 * @var int
	 */
	const LEGACY_SPEED = 300;

	/**
	 * Swiper's autoplay delay, used when the slider kept the default.
	 *
	 * @var int
	 */
	const LEGACY_INTERVAL = 3000;

	/**
	 * Style and class attributes that both block versions support.
	 *
	 * @var string[]
	 */
	const SHARED_ATTRIBUTES = [ 'align', 'className', 'backgroundColor', 'textColor', 'gradient', 'style' ];

	/**
	 * Converts every Slider Block slider in a block list, at any depth.
	 *
	 * @param  array[]  $blocks Parsed blocks.
	 * @param  string[] $notes  Collects the settings that have no equivalent.
	 * @param  int      $count  Counts the converted sliders.
	 * @return array[]
	 */
	public static function convert_blocks( array $blocks, array &$notes = [], int &$count = 0 ): array {
		foreach ( $blocks as $index => $block ) {
			if ( self::SLIDER === ( $block['blockName'] ?? '' ) ) {
				$blocks[ $index ] = self::convert_slider( $block, $notes, $count );
				++$count;
				continue;
			}

			if ( ! empty( $block['innerBlocks'] ) ) {
				$blocks[ $index ]['innerBlocks'] = self::convert_blocks( $block['innerBlocks'], $notes, $count );
			}
		}

		return $blocks;
	}

	/**
	 * Converts one Slider Block slider.
	 *
	 * The slides move into an `outstand/slides` block. Inner blocks that are not
	 * slides are dropped. Navigation, pagination and counter blocks follow the
	 * slides when the slider settings show them.
	 *
	 * @param  array    $block Parsed `pixelalbatross/slider` block.
	 * @param  string[] $notes Collects the settings that have no equivalent.
	 * @param  int      $count Counts the sliders converted inside the slides.
	 * @return array Parsed `outstand/carousel` block.
	 */
	public static function convert_slider( array $block, array &$notes = [], int &$count = 0 ): array {
		$attributes = $block['attrs'] ?? [];
		$mapped     = self::map_slider_attributes( $attributes, $notes );

		$slides = [];

		foreach ( $block['innerBlocks'] ?? [] as $slide ) {
			if ( self::SLIDE !== ( $slide['blockName'] ?? '' ) ) {
				continue;
			}

			$slides[] = self::convert_slide( $slide, $notes, $count );
		}

		$inner_blocks = [ self::make_block( 'outstand/slides', [], $slides ) ];

		if ( $mapped['navigation'] ) {
			$inner_blocks[] = self::make_block( 'outstand/carousel-navigation' );
		}

		switch ( $mapped['pagination'] ) {
			case 'dots':
				$inner_blocks[] = self::make_block( 'outstand/carousel-pagination' );
				break;
			case 'progress':
				$inner_blocks[] = self::make_block( 'outstand/carousel-pagination', [ 'type' => 'progress' ] );
				break;
			case 'counter':
				$inner_blocks[] = self::make_block( 'outstand/carousel-counter' );
				break;
			default:
				break;
		}

		$notes = array_values( array_unique( $notes ) );

		return self::make_block( 'outstand/carousel', $mapped['attributes'], $inner_blocks );
	}

	/**
	 * Maps Slider Block slider attributes to `outstand/carousel` attributes.
	 *
	 * The slide ratio, maximum slide height and image fit keep their defaults, so
	 * images in slides keep their ratio, as in Slider Block.
	 *
	 * @param  array    $attributes Slider Block attributes.
	 * @param  string[] $notes      Collects the settings that have no equivalent.
	 * @return array{attributes: array, navigation: bool, pagination: ?string}
	 */
	public static function map_slider_attributes( array $attributes, array &$notes = [] ): array {
		$mapped = self::pick_shared( $attributes );

		if ( ! empty( $attributes['ariaLabel'] ) ) {
			$mapped['ariaLabel'] = $attributes['ariaLabel'];
		}

		if ( ! empty( $attributes['loop'] ) ) {
			$mapped['type'] = 'loop';
		}

		if ( ! empty( $attributes['rewind'] ) ) {
			$mapped['rewind'] = true;
		}

		if ( ! empty( $attributes['autoHeight'] ) ) {
			$mapped['autoHeight'] = true;
		}

		$per_page = (int) ( $attributes['perView'] ?? 1 );

		if ( $per_page > 1 ) {
			$mapped['perPage'] = $per_page;
		}

		if ( ! empty( $attributes['centerSlides'] ) ) {
			$mapped['focusCenter'] = true;
		}

		if ( ! empty( $attributes['freeMode'] ) ) {
			$mapped['freeDrag'] = true;
		}

		$mapped['speed'] = (int) ( $attributes['speed'] ?? self::LEGACY_SPEED );

		if ( ! empty( $attributes['autoplay'] ) ) {
			$mapped['autoplay']     = true;
			$mapped['interval']     = (int) ( $attributes['autoplayInterval'] ?? self::LEGACY_INTERVAL );
			$mapped['pauseOnHover'] = ! empty( $attributes['autoplayPauseOnHover'] );
		}

		$gap = self::to_pixels( $attributes['spaceBetween'] ?? '' );

		if ( '' !== $gap ) {
			$mapped['gap'] = $gap;
		}

		// Swiper sizes a horizontal slider by its width only, so the height had no visible effect.
		if ( ! empty( $attributes['height'] ) ) {
			$notes[] = 'height';
		}

		if ( ! empty( $attributes['width'] ) ) {
			$notes[] = 'width';
		}

		if ( ! empty( $attributes['hashNavigation'] ) ) {
			$mapped['hashNavigation'] = true;
		}

		$pagination = null;

		if ( ! empty( $attributes['pagination'] ) ) {
			$pagination_type = $attributes['paginationType'] ?? 'bullets';

			switch ( $pagination_type ) {
				case 'bullets':
					$pagination = 'dots';
					break;
				case 'fraction':
					$pagination = 'counter';
					break;
				case 'progressbar':
					$pagination = 'progress';
					break;
				default:
					$pagination = 'dots';
					$notes[]    = 'paginationType';
					break;
			}
		}

		return [
			'attributes' => $mapped,
			'navigation' => ! empty( $attributes['navigation'] ),
			'pagination' => $pagination,
		];
	}

	/**
	 * Converts one Slider Block slide, and the sliders inside its content.
	 *
	 * @param  array    $slide Parsed `pixelalbatross/slide` block.
	 * @param  string[] $notes Collects the settings that have no equivalent.
	 * @param  int      $count Counts the sliders converted inside the slide.
	 * @return array Parsed `outstand/slide` block.
	 */
	private static function convert_slide( array $slide, array &$notes, int &$count ): array {
		$attributes = $slide['attrs'] ?? [];
		$mapped     = self::pick_shared( $attributes );

		if ( ! empty( $attributes['hash'] ) ) {
			$mapped['hash'] = $attributes['hash'];
		}

		$inner_blocks = self::convert_blocks( $slide['innerBlocks'] ?? [], $notes, $count );

		return self::make_block( 'outstand/slide', $mapped, $inner_blocks );
	}

	/**
	 * Builds a parsed block whose saved markup is only its inner blocks.
	 *
	 * @param  string  $name         Block name.
	 * @param  array   $attributes   Block attributes.
	 * @param  array[] $inner_blocks Inner blocks.
	 * @return array
	 */
	private static function make_block( string $name, array $attributes = [], array $inner_blocks = [] ): array {
		return [
			'blockName'    => $name,
			'attrs'        => $attributes,
			'innerBlocks'  => $inner_blocks,
			'innerHTML'    => '',
			'innerContent' => array_fill( 0, count( $inner_blocks ), null ),
		];
	}

	/**
	 * Returns the style and class attributes that both block versions support.
	 *
	 * @param  array $attributes Slider Block attributes.
	 * @return array
	 */
	private static function pick_shared( array $attributes ): array {
		return array_intersect_key( $attributes, array_flip( self::SHARED_ATTRIBUTES ) );
	}

	/**
	 * Turns a Slider Block length into the pixel length Swiper used.
	 *
	 * Swiper read the number at the start of the value as pixels and ignored any unit.
	 *
	 * @param  mixed $value Slider Block value.
	 * @return string CSS length in pixels, or an empty string for no length.
	 */
	private static function to_pixels( mixed $value ): string {
		if ( ! is_string( $value ) && ! is_int( $value ) && ! is_float( $value ) ) {
			return '';
		}

		$quantity = (float) trim( (string) $value );

		if ( ! is_finite( $quantity ) || 0.0 === $quantity ) {
			return '';
		}

		return $quantity . 'px';
	}
}
