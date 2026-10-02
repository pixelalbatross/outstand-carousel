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

use Outstand\WP\Carousel\Slides;

defined( 'ABSPATH' ) || exit;

$extra_attributes = [ 'class' => 'splide__slide' ];
$slide_hash       = sanitize_title( $attributes['hash'] ?? '' );
$backdrop         = in_array( $attributes['backdrop'] ?? '', [ 'blur' ], true ) ? $attributes['backdrop'] : '';
$backdrop_url     = '' !== $backdrop ? Slides::get_backdrop_url( $block->parsed_block ) : '';

// A copy of the slide's image, such as blurred, fills the space around it.
if ( '' !== $backdrop_url ) {
	$extra_attributes['class'] .= ' has-backdrop-' . $backdrop;
	$extra_attributes['style']  = '--outstand-carousel-backdrop:url(' . esc_url( $backdrop_url ) . ');';
}

// With hash navigation on, `#<hash>` in the page URL opens the carousel on this slide.
if ( ! empty( $block->context['outstand/carousel/hashNavigation'] ) && '' !== $slide_hash ) {
	$extra_attributes['data-hash'] = $slide_hash;
}
?>
<li <?php echo get_block_wrapper_attributes( $extra_attributes ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
</li>
