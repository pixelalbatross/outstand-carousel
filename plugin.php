<?php // phpcs:ignore Generic.Commenting.DocComment.MissingShort
/**
 * @wordpress-plugin
 * Plugin Name:       Outstand Carousel
 * Description:       Carousel block with composable navigation, pagination and counter, powered by Splide and the Interactivity API.
 * Plugin URI:        https://outstand.site/?utm_source=wp-plugins&utm_medium=outstand-carousel&utm_campaign=plugin-uri
 * Requires at least: 7.1
 * Requires PHP:      8.2
 * Version:           1.4.0
 * Author:            Outstand
 * Author URI:        https://outstand.site/?utm_source=wp-plugins&utm_medium=outstand-carousel&utm_campaign=author-uri
 * License:           GPL-3.0-or-later
 * License URI:       https://spdx.org/licenses/GPL-3.0-or-later.html
 * Update URI:        https://outstand.site/
 * GitHub Plugin URI: https://github.com/pixelalbatross/outstand-carousel
 * Text Domain:       outstand-carousel
 * Domain Path:       /languages
 */

namespace Outstand\WP\Carousel;

use YahnisElsts\PluginUpdateChecker\v5\PucFactory;

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

define( 'OUTSTAND_CAROUSEL_VERSION', '1.4.0' );
define( 'OUTSTAND_CAROUSEL_BASENAME', plugin_basename( __FILE__ ) );
define( 'OUTSTAND_CAROUSEL_URL', plugin_dir_url( __FILE__ ) );
define( 'OUTSTAND_CAROUSEL_PATH', plugin_dir_path( __FILE__ ) );
define( 'OUTSTAND_CAROUSEL_DIST_URL', OUTSTAND_CAROUSEL_URL . 'build/' );
define( 'OUTSTAND_CAROUSEL_DIST_PATH', OUTSTAND_CAROUSEL_PATH . 'build/' );

if ( file_exists( OUTSTAND_CAROUSEL_PATH . 'vendor/autoload.php' ) ) {
	require_once OUTSTAND_CAROUSEL_PATH . 'vendor/autoload.php';
}

if ( class_exists( PucFactory::class ) ) {
	PucFactory::buildUpdateChecker(
		'https://github.com/pixelalbatross/outstand-carousel/',
		__FILE__,
		'outstand-carousel'
	)->setBranch( 'main' );
}

add_action(
	'plugins_loaded',
	function () {
		Plugin::get_instance()->enable();
	}
);
