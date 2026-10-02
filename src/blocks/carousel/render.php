<?php
/**
 * Carousel block markup.
 *
 * @package Outstand
 *
 * @var array     $attributes Block attributes.
 * @var string    $content    Block content.
 * @var \WP_Block $block      Block instance.
 */

namespace Outstand\WP\Carousel;

defined( 'ABSPATH' ) || exit;

$total = count( Slides::find( $block->parsed_block ) );

if ( ! $total ) {
	return;
}

$carousel_type   = in_array( $attributes['type'], [ 'slide', 'loop', 'fade' ], true ) ? $attributes['type'] : 'slide';
$slides_per_page = 'fade' === $carousel_type ? 1 : max( 1, (int) $attributes['perPage'] );
$gap             = (string) $attributes['gap'];
$height          = (string) $attributes['height'];
$aspect_ratio    = (string) ( $attributes['aspectRatio'] ?? '' );
$max_height      = (string) ( $attributes['maxHeight'] ?? '' );
$image_fit       = in_array( $attributes['imageFit'] ?? '', [ 'cover', 'contain' ], true ) ? $attributes['imageFit'] : '';

// A ratio is a number or two numbers divided by a slash, such as "16/9".
if ( ! preg_match( '#^\d+(\.\d+)?(\s*/\s*\d+(\.\d+)?)?$#', $aspect_ratio ) ) {
	$aspect_ratio = '';
}

$options = [
	'type'         => $carousel_type,
	'perPage'      => $slides_per_page,
	'gap'          => '' === $gap ? 0 : $gap,
	'speed'        => (int) $attributes['speed'],
	'rewind'       => (bool) $attributes['rewind'],
	'autoHeight'   => (bool) $attributes['autoHeight'],
	'drag'         => $attributes['freeDrag'] ? 'free' : true,
	'autoplay'     => (bool) $attributes['autoplay'],
	'interval'     => (int) $attributes['interval'],
	'pauseOnHover' => (bool) $attributes['pauseOnHover'],
	'keyboard'     => true,
	'arrows'       => false,
	'pagination'   => false,
	'i18n'         => [
		'prev'       => __( 'Previous slide', 'outstand-carousel' ),
		'next'       => __( 'Next slide', 'outstand-carousel' ),
		'first'      => __( 'Go to first slide', 'outstand-carousel' ),
		'last'       => __( 'Go to last slide', 'outstand-carousel' ),
		/* translators: %s: slide number. */
		'slideX'     => __( 'Go to slide %s', 'outstand-carousel' ),
		/* translators: %s: page number. */
		'pageX'      => __( 'Go to page %s', 'outstand-carousel' ),
		'play'       => __( 'Start autoplay', 'outstand-carousel' ),
		'pause'      => __( 'Pause autoplay', 'outstand-carousel' ),
		'carousel'   => __( 'carousel', 'outstand-carousel' ),
		'slide'      => __( 'slide', 'outstand-carousel' ),
		'select'     => __( 'Select a slide to show', 'outstand-carousel' ),
		/* translators: 1: slide number, 2: number of slides. */
		'slideLabel' => __( '%1$s of %2$s', 'outstand-carousel' ),
	],
];

if ( $attributes['focusCenter'] ) {
	$options['focus'] = 'center';
}

if ( '' !== $height ) {
	$options['height'] = $height;
}

$per_page_mobile = (int) ( $attributes['perPageMobile'] ?? 0 );

if ( $per_page_mobile && 'fade' !== $carousel_type ) {
	$options['breakpoints'] = [
		781 => [ 'perPage' => $per_page_mobile ],
	];
}

/**
 * Filters the Splide options of a carousel.
 *
 * @see https://splidejs.com/guides/options/
 *
 * @param array     $options    Splide options.
 * @param array     $attributes Block attributes.
 * @param \WP_Block $block      Block instance.
 */
$options = apply_filters( 'outstand_carousel_options', $options, $attributes, $block );

$carousel_id = ! empty( $attributes['anchor'] ) ? $attributes['anchor'] : wp_unique_id( 'outstand-carousel-' );
$is_loop     = 'loop' === $options['type'];

// The last index Splide can move to: past it, a page would leave empty space.
$end_index = 'slide' === $options['type'] && empty( $options['focus'] ) ? max( 0, $total - $options['perPage'] ) : $total - 1;

Interactivity::register_state();

$styles = [ '--outstand-carousel-per-page:' . (int) $options['perPage'] ];

if ( '' !== $gap ) {
	$styles[] = '--outstand-carousel-gap:' . $gap;
}

if ( '' !== $height ) {
	$styles[] = '--outstand-carousel-height:' . $height;
}

$classes = [ 'splide' ];

if ( '' !== $aspect_ratio ) {
	$styles[]  = '--outstand-carousel-aspect-ratio:' . $aspect_ratio;
	$classes[] = 'has-slide-aspect-ratio';
}

if ( '' !== $max_height ) {
	$styles[]  = '--outstand-carousel-max-height:' . $max_height;
	$classes[] = 'has-slide-max-height';
}

if ( '' !== $image_fit ) {
	$styles[] = '--outstand-carousel-image-fit:' . $image_fit;
}

$extra_attributes = [
	'class' => implode( ' ', $classes ),
	'style' => implode( ';', $styles ) . ';',
];

if ( empty( $attributes['anchor'] ) ) {
	$extra_attributes['id'] = $carousel_id;
}

$context = [
	'id'             => $carousel_id,
	'trackId'        => $carousel_id . '-track',
	'options'        => $options,
	'activeIndex'    => 0,
	'total'          => $total,
	'endIndex'       => $end_index,
	'isLooping'      => $is_loop || ! empty( $options['rewind'] ),
	'isPlaying'      => ! empty( $options['autoplay'] ),
	'hashNavigation' => (bool) $attributes['hashNavigation'],
];
?>
<div
	<?php echo get_block_wrapper_attributes( $extra_attributes ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	data-wp-interactive="<?php echo esc_attr( Interactivity::NAMESPACE ); ?>"
	<?php echo wp_interactivity_data_wp_context( $context ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	data-wp-init="callbacks.init"
>
	<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
</div>
