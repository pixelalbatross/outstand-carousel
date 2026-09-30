/**
 * Slides block.
 */
import { registerBlockType } from '@wordpress/blocks';

import metadata from './block.json';
import SlidesEdit from './edit';
import SlidesSave from './save';
import './editor.scss';

registerBlockType( metadata.name, {
	edit: SlidesEdit,
	save: SlidesSave,
} );
