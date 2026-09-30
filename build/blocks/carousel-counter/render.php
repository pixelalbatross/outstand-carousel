<?php
/**
 * Carousel Counter block markup.
 *
 * @package Outstand
 *
 * @var array     $attributes Block attributes.
 * @var string    $content    Block content.
 * @var \WP_Block $block      Block instance.
 */

namespace Outstand\WP\Carousel;

defined( 'ABSPATH' ) || exit;

$slide_count = count( $block->context[ Blocks::SLIDES_CONTEXT ] ?? [] );

if ( $slide_count < 2 ) {
	return;
}

$context = [
	'separator'  => (string) $attributes['separator'],
	'padNumbers' => (bool) $attributes['padNumbers'],
];
?>
<div
	<?php echo get_block_wrapper_attributes(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	<?php echo wp_interactivity_data_wp_context( $context ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	data-wp-text="state.counter"
></div>
