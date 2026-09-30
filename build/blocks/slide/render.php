<?php
/**
 * Slide block markup.
 *
 * @package Outstand
 *
 * @var array     $attributes Block attributes.
 * @var string    $content    Block content.
 * @var \WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$extra_attributes = [ 'class' => 'splide__slide' ];
$slide_hash       = sanitize_title( $attributes['hash'] ?? '' );

// With hash navigation on, `#<hash>` in the page URL opens the carousel on this slide.
if ( ! empty( $block->context['outstand/carousel/hashNavigation'] ) && '' !== $slide_hash ) {
	$extra_attributes['data-hash'] = $slide_hash;
}
?>
<li <?php echo get_block_wrapper_attributes( $extra_attributes ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
</li>
