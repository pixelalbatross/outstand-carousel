<?php
/**
 * Carousel Pagination block markup.
 *
 * @package Outstand
 *
 * @var array     $attributes Block attributes.
 * @var string    $content    Block content.
 * @var \WP_Block $block      Block instance.
 */

namespace Outstand\WP\Carousel;

defined( 'ABSPATH' ) || exit;

$media_ids   = $block->context[ Blocks::SLIDES_CONTEXT ] ?? [];
$slide_count = count( $media_ids );

if ( $slide_count < 2 ) {
	return;
}

$pagination_type = 'thumbnails' === $attributes['type'] ? 'thumbnails' : 'dots';
?>
<ul <?php echo get_block_wrapper_attributes( [ 'class' => 'is-type-' . $pagination_type ] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<?php foreach ( $media_ids as $index => $media_id ) : ?>
		<li class="wp-block-outstand-carousel-pagination__entry">
			<button
				type="button"
				class="wp-block-outstand-carousel-pagination__item"
				<?php /* translators: %d: slide number. */ ?>
				aria-label="<?php echo esc_attr( sprintf( __( 'Go to slide %d', 'outstand-carousel' ), $index + 1 ) ); ?>"
				<?php echo wp_interactivity_data_wp_context( [ 'index' => $index ] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				data-wp-bind--aria-controls="context.trackId"
				data-wp-bind--aria-current="state.isActive"
				data-wp-class--is-active="state.isActive"
				data-wp-on--click="actions.goTo"
			>
				<?php if ( 'thumbnails' === $pagination_type ) : ?>
					<?php if ( $media_id ) : ?>
						<?php
						echo wp_get_attachment_image( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
							$media_id,
							$attributes['thumbnailSize'],
							false,
							[
								'alt'     => '',
								'class'   => 'wp-block-outstand-carousel-pagination__image',
								'loading' => 'lazy',
							]
						);
						?>
					<?php else : ?>
						<span class="wp-block-outstand-carousel-pagination__number"><?php echo esc_html( (string) ( $index + 1 ) ); ?></span>
					<?php endif; ?>
				<?php endif; ?>
			</button>
		</li>
	<?php endforeach; ?>
</ul>
