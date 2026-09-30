/**
 * Carousel block.
 */
import { registerBlockType, createBlock } from '@wordpress/blocks';
import { dispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';

import '../../shared/editor-store';
import { convertLegacySlider } from '../../shared/legacy';
import metadata from './block.json';
import CarouselEdit from './edit';
import CarouselSave from './save';
import './editor.scss';
import './style.scss';

/**
 * Describes a setting that has no equivalent.
 *
 * @param {string} note Note code from the converter.
 * @return {string} Description.
 */
function describeNote( note ) {
	switch ( note ) {
		case 'width':
			return __(
				'slider width dropped, use the block width or alignment',
				'outstand-carousel'
			);
		case 'hashNavigation':
			return __( 'URL hash navigation dropped', 'outstand-carousel' );
		case 'slideHash':
			return __( 'slide URL hashes dropped', 'outstand-carousel' );
		case 'paginationType':
			return __(
				'pagination type replaced with dots',
				'outstand-carousel'
			);
		default:
			return note;
	}
}

/**
 * Creates blocks from converter specs, keeping existing blocks as they are.
 *
 * @param {Object} spec Block spec or existing block.
 * @return {Object} Block.
 */
function createFromSpec( spec ) {
	if ( spec.clientId ) {
		return spec;
	}

	return createBlock(
		spec.name,
		spec.attributes,
		spec.innerBlocks.map( createFromSpec )
	);
}

registerBlockType( metadata.name, {
	edit: CarouselEdit,
	save: CarouselSave,
	transforms: {
		from: [
			{
				type: 'block',
				blocks: [ 'pixelalbatross/slider' ],
				transform: ( attributes, innerBlocks ) => {
					const { block, notes } = convertLegacySlider(
						attributes,
						innerBlocks
					);

					if ( notes.length ) {
						dispatch( noticesStore ).createWarningNotice(
							sprintf(
								/* translators: %s: list of settings. */
								__(
									'Slider converted to a carousel. Settings without an equivalent: %s.',
									'outstand-carousel'
								),
								notes.map( describeNote ).join( '; ' )
							),
							{ id: 'outstand-carousel-legacy-transform' }
						);
					}

					return createFromSpec( block );
				},
			},
		],
	},
} );
