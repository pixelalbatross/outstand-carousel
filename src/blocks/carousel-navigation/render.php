<?php
/**
 * Carousel Navigation block markup.
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

$icon_args = [
	'size'  => (int) $attributes['iconSize'],
	'class' => 'wp-block-outstand-carousel-navigation__icon',
];

$previous_icon = wp_get_icon( $attributes['previousIcon'], $icon_args ) ?: wp_get_icon( 'core/arrow-left', $icon_args );
$next_icon     = wp_get_icon( $attributes['nextIcon'], $icon_args ) ?: wp_get_icon( 'core/arrow-right', $icon_args );
$has_autoplay  = ! empty( $block->context['outstand/carousel/autoplay'] );
?>
<div <?php echo get_block_wrapper_attributes(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<button
		type="button"
		class="wp-block-outstand-carousel-navigation__button is-previous"
		aria-label="<?php esc_attr_e( 'Previous slide', 'outstand-carousel' ); ?>"
		data-wp-bind--aria-controls="context.trackId"
		data-wp-bind--disabled="!state.canGoPrev"
		data-wp-on--click="actions.prev"
	>
		<?php echo $previous_icon; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- sanitized by the icon registry. ?>
	</button>

	<?php if ( $has_autoplay ) : ?>
		<button
			type="button"
			class="wp-block-outstand-carousel-navigation__button is-toggle"
			data-wp-bind--aria-label="state.autoplayLabel"
			data-wp-bind--aria-controls="context.trackId"
			data-wp-class--is-playing="context.isPlaying"
			data-wp-on--click="actions.toggleAutoplay"
		>
			<?php
			// phpcs:disable WordPress.Security.EscapeOutput.OutputNotEscaped -- sanitized by the icon registry.
			echo wp_get_icon( Icons::COLLECTION . '/play', array_merge( $icon_args, [ 'class' => 'wp-block-outstand-carousel-navigation__icon is-play' ] ) );
			echo wp_get_icon( Icons::COLLECTION . '/pause', array_merge( $icon_args, [ 'class' => 'wp-block-outstand-carousel-navigation__icon is-pause' ] ) );
			// phpcs:enable WordPress.Security.EscapeOutput.OutputNotEscaped
			?>
		</button>
	<?php endif; ?>

	<button
		type="button"
		class="wp-block-outstand-carousel-navigation__button is-next"
		aria-label="<?php esc_attr_e( 'Next slide', 'outstand-carousel' ); ?>"
		data-wp-bind--aria-controls="context.trackId"
		data-wp-bind--disabled="!state.canGoNext"
		data-wp-on--click="actions.next"
	>
		<?php echo $next_icon; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- sanitized by the icon registry. ?>
	</button>
</div>
