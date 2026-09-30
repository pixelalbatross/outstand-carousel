/**
 * Slides block save: the inner blocks only. The server renders the markup.
 */
import { InnerBlocks } from '@wordpress/block-editor';

export default function SlidesSave() {
	return <InnerBlocks.Content />;
}
