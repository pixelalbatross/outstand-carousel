/**
 * Carousel Counter block.
 */
import { registerBlockType } from '@wordpress/blocks';

import metadata from './block.json';
import CarouselCounterEdit from './edit';
import './style.scss';

registerBlockType( metadata.name, {
	edit: CarouselCounterEdit,
	save: () => null,
} );
