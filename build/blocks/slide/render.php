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
?>
<li <?php echo get_block_wrapper_attributes( [ 'class' => 'splide__slide' ] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
</li>
