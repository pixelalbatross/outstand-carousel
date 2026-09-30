<?php

namespace Outstand\WP\Carousel;

defined( 'ABSPATH' ) || exit;

/**
 * Server side of the `outstand/carousel` Interactivity API store.
 *
 * The derived state mirrors the getters in `src/blocks/carousel/view.js`, so the
 * server renders the same HTML the client produces on the first slide.
 */
class Interactivity {

	/**
	 * Store namespace.
	 *
	 * @var string
	 */
	const NAMESPACE = 'outstand/carousel';

	/**
	 * Registers the store's translated strings and derived state.
	 *
	 * @return void
	 */
	public static function register_state(): void {
		wp_interactivity_state(
			self::NAMESPACE,
			[
				'i18n'          => [
					'play'  => __( 'Start autoplay', 'outstand-carousel' ),
					'pause' => __( 'Pause autoplay', 'outstand-carousel' ),
				],
				'isActive'      => static function (): bool {
					$context = wp_interactivity_get_context();
					return isset( $context['index'] ) && $context['index'] === $context['activeIndex'];
				},
				'canGoPrev'     => static function (): bool {
					$context = wp_interactivity_get_context();
					return $context['isLooping'] || $context['activeIndex'] > 0;
				},
				'canGoNext'     => static function (): bool {
					$context = wp_interactivity_get_context();
					return $context['isLooping'] || $context['activeIndex'] < $context['endIndex'];
				},
				'counter'       => static function (): string {
					$context = wp_interactivity_get_context();
					return self::format_counter( $context['activeIndex'] + 1, $context['total'], $context['separator'], $context['padNumbers'] );
				},
				'autoplayLabel' => static function (): string {
					$context = wp_interactivity_get_context();
					$state   = wp_interactivity_state( self::NAMESPACE );
					return $context['isPlaying'] ? $state['i18n']['pause'] : $state['i18n']['play'];
				},
			]
		);
	}

	/**
	 * Formats the counter text, such as "1 / 5" or "01 / 05".
	 *
	 * @param  int    $current    Current slide number, from 1.
	 * @param  int    $total      Number of slides.
	 * @param  string $separator  Text between the two numbers.
	 * @param  bool   $pad        Whether to pad both numbers with zeros to at least two digits.
	 * @return string
	 */
	public static function format_counter( int $current, int $total, string $separator, bool $pad ): string {
		if ( $pad ) {
			$digits  = max( 2, strlen( (string) $total ) );
			$current = str_pad( (string) $current, $digits, '0', STR_PAD_LEFT );
			$total   = str_pad( (string) $total, $digits, '0', STR_PAD_LEFT );
		}

		return $current . $separator . $total;
	}
}
