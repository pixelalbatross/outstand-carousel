<?php

namespace Outstand\WP\Carousel;

defined( 'ABSPATH' ) || exit;

class Icons extends BaseModule {

	/**
	 * Icon collection slug.
	 *
	 * @var string
	 */
	const COLLECTION = 'outstand-carousel';

	/**
	 * Directory holding the icon SVG files, relative to the plugin root.
	 *
	 * @var string
	 */
	const SVG_DIR = 'assets/svg/';

	/**
	 * {@inheritDoc}
	 */
	public function register(): void {
		add_action( 'init', [ $this, 'register_icons' ] );
	}

	/**
	 * Registers the icons the core collection lacks, one per SVG file in `assets/svg/`.
	 *
	 * The registry reads each file the first time the icon is used.
	 *
	 * @return void
	 */
	public function register_icons(): void {
		wp_register_icon_collection(
			self::COLLECTION,
			[
				'label' => __( 'Outstand Carousel', 'outstand-carousel' ),
			]
		);

		$labels = [
			'play'  => __( 'Play', 'outstand-carousel' ),
			'pause' => __( 'Pause', 'outstand-carousel' ),
		];

		foreach ( $labels as $name => $label ) {
			wp_register_icon(
				self::COLLECTION . '/' . $name,
				[
					'label'     => $label,
					'file_path' => OUTSTAND_CAROUSEL_PATH . self::SVG_DIR . $name . '.svg',
				]
			);
		}
	}

	/**
	 * Returns a registered icon's markup, falling back to another icon when it isn't registered.
	 *
	 * The `<svg>` gets an `is-icon-collection-<collection>` class, so a theme can
	 * style its own icons, such as outline icons whose stroke the registry drops.
	 *
	 * @param  string $name       Icon name, such as `core/arrow-left`.
	 * @param  string $fallback   Icon name to use when `$name` isn't registered.
	 * @param  int    $size       Width and height in pixels.
	 * @param  string $class_name Classes for the `<svg>` element.
	 * @return string Sanitized SVG markup, or an empty string.
	 */
	public static function render( string $name, string $fallback, int $size, string $class_name ): string {
		$registry = \WP_Icons_Registry::get_instance();
		$icon     = $registry->is_registered( $name ) ? $name : $fallback;

		return wp_get_icon(
			$icon,
			[
				'size'  => $size,
				'class' => $class_name . ' is-icon-collection-' . strtok( $icon, '/' ),
			]
		);
	}
}
