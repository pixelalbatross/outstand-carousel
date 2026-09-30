/**
 * Carousel Navigation block.
 */
import { registerBlockType } from '@wordpress/blocks';

import metadata from './block.json';
import CarouselNavigationEdit from './edit';
import './style.scss';

registerBlockType( metadata.name, {
	edit: CarouselNavigationEdit,
	save: () => null,
} );
