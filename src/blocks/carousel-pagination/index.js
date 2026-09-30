/**
 * Carousel Pagination block.
 */
import { registerBlockType } from '@wordpress/blocks';

import metadata from './block.json';
import CarouselPaginationEdit from './edit';
import './style.scss';

registerBlockType( metadata.name, {
	edit: CarouselPaginationEdit,
	save: () => null,
} );
