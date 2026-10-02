<?php

namespace Outstand\WP\Carousel;

defined( 'ABSPATH' ) || exit;

/**
 * Reads slides and their media from parsed carousel blocks.
 */
class Slides {

	/**
	 * Returns the slide blocks of a carousel.
	 *
	 * @param  array $carousel Parsed `outstand/carousel` block.
	 * @return array[] Parsed `outstand/slide` blocks.
	 */
	public static function find( array $carousel ): array {
		$slides_block = self::find_block( $carousel['innerBlocks'] ?? [], 'outstand/slides' );

		if ( ! $slides_block ) {
			return [];
		}

		return array_values(
			array_filter(
				$slides_block['innerBlocks'] ?? [],
				static fn( $block ) => 'outstand/slide' === ( $block['blockName'] ?? '' )
			)
		);
	}

	/**
	 * Returns the attachment that represents a slide.
	 *
	 * That is the first image or cover inside the slide, else the slide's
	 * background image.
	 *
	 * @param  array $slide Parsed `outstand/slide` block.
	 * @return int Attachment ID, or 0 when the slide has no media.
	 */
	public static function get_media_id( array $slide ): int {
		$media_id = self::find_media_id( $slide['innerBlocks'] ?? [] );

		if ( $media_id ) {
			return $media_id;
		}

		return absint( $slide['attrs']['style']['background']['backgroundImage']['id'] ?? 0 );
	}

	/**
	 * Returns a small copy of the image that represents a slide, for its backdrop.
	 *
	 * @param  array $slide Parsed `outstand/slide` block.
	 * @return string Image URL, or an empty string when the slide has no media.
	 */
	public static function get_backdrop_url( array $slide ): string {
		$media_id = self::get_media_id( $slide );

		return $media_id ? (string) wp_get_attachment_image_url( $media_id, 'medium' ) : '';
	}

	/**
	 * Finds the first block with a given name, depth first.
	 *
	 * @param  array[] $blocks Parsed blocks.
	 * @param  string  $name   Block name.
	 * @return array|null
	 */
	private static function find_block( array $blocks, string $name ): ?array {
		foreach ( $blocks as $block ) {
			if ( $name === ( $block['blockName'] ?? '' ) ) {
				return $block;
			}

			$found = self::find_block( $block['innerBlocks'] ?? [], $name );

			if ( $found ) {
				return $found;
			}
		}

		return null;
	}

	/**
	 * Finds the first image or cover attachment, depth first.
	 *
	 * @param  array[] $blocks Parsed blocks.
	 * @return int
	 */
	private static function find_media_id( array $blocks ): int {
		foreach ( $blocks as $block ) {
			$name = $block['blockName'] ?? '';

			if ( in_array( $name, [ 'core/image', 'core/cover' ], true ) ) {
				$media_id = absint( $block['attrs']['id'] ?? 0 );

				if ( $media_id && wp_attachment_is_image( $media_id ) ) {
					return $media_id;
				}
			}

			$media_id = self::find_media_id( $block['innerBlocks'] ?? [] );

			if ( $media_id ) {
				return $media_id;
			}
		}

		return 0;
	}
}
