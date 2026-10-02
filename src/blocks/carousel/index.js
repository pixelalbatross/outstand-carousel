/**
 * Carousel block.
 */
import { registerBlockType } from '@wordpress/blocks';

import '../../shared/editor-store';
import metadata from './block.json';
import CarouselEdit from './edit';
import CarouselSave from './save';
import './editor.scss';
import './style.scss';

registerBlockType( metadata.name, {
	edit: CarouselEdit,
	save: CarouselSave,
} );
