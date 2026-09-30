/**
 * Slide block.
 */
import { registerBlockType } from '@wordpress/blocks';

import metadata from './block.json';
import SlideEdit from './edit';
import SlideSave from './save';

registerBlockType( metadata.name, {
	edit: SlideEdit,
	save: SlideSave,
} );
