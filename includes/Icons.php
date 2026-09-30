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
}
