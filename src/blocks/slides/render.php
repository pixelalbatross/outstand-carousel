<?php
/**
 * Slides block markup: Splide's track and list.
 *
 * @package Outstand
 *
 * @var array     $attributes Block attributes.
 * @var string    $content    Block content.
 * @var \WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;
?>
<div
	<?php echo get_block_wrapper_attributes( [ 'class' => 'splide__track' ] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	data-wp-bind--id="context.trackId"
>
	<ul class="splide__list">
		<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	</ul>
</div>
