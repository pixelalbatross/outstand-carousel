import { describe, it, expect } from 'vitest';

import {
	LEGACY_SLIDE,
	LEGACY_SLIDER,
	convertLegacyBlocks,
	convertLegacySlider,
	mapSliderAttributes,
} from './legacy';
import attributeFixtures from '../../tests/fixtures/legacy-attributes.json';
import blockFixtures from '../../tests/fixtures/legacy-blocks.json';
import carouselMetadata from '../blocks/carousel/block.json';
import counterMetadata from '../blocks/carousel-counter/block.json';
import navigationMetadata from '../blocks/carousel-navigation/block.json';
import paginationMetadata from '../blocks/carousel-pagination/block.json';
import slideMetadata from '../blocks/slide/block.json';
import slidesMetadata from '../blocks/slides/block.json';

const METADATA = Object.fromEntries(
	[
		carouselMetadata,
		counterMetadata,
		navigationMetadata,
		paginationMetadata,
		slideMetadata,
		slidesMetadata,
	].map( ( metadata ) => [ metadata.name, metadata ] )
);

/**
 * Returns the attributes a block accepts: its own and the ones its supports add.
 *
 * @param {Object} metadata Block metadata.
 * @return {string[]} Attribute names.
 */
function getAcceptedAttributes( metadata ) {
	const { supports = {} } = metadata;
	const accepted = [ ...Object.keys( metadata.attributes ?? {} ), 'style' ];

	if ( supports.className !== false ) {
		accepted.push( 'className' );
	}

	if ( supports.align ) {
		accepted.push( 'align' );
	}

	if ( supports.anchor ) {
		accepted.push( 'anchor' );
	}

	if ( supports.ariaLabel ) {
		accepted.push( 'ariaLabel' );
	}

	if ( supports.color?.background ) {
		accepted.push( 'backgroundColor' );
	}

	if ( supports.color?.text ) {
		accepted.push( 'textColor' );
	}

	if ( supports.color?.gradients ) {
		accepted.push( 'gradient' );
	}

	return accepted;
}

/**
 * Lists the Outstand Carousel blocks of a spec tree.
 *
 * @param {Object[]} blocks Block specs.
 * @return {Object[]} Specs of `outstand/*` blocks.
 */
function collectCarouselBlocks( blocks ) {
	return blocks.flatMap( ( block ) => [
		...( block.name.startsWith( 'outstand/' ) ? [ block ] : [] ),
		...collectCarouselBlocks( block.innerBlocks ?? [] ),
	] );
}

describe( 'mapSliderAttributes', () => {
	it.each(
		attributeFixtures.map( ( fixture ) => [ fixture.description, fixture ] )
	)( '%s', ( _description, fixture ) => {
		expect( mapSliderAttributes( fixture.attributes ) ).toEqual(
			fixture.expected
		);
	} );
} );

describe( 'convertLegacyBlocks', () => {
	it.each(
		blockFixtures.map( ( fixture ) => [ fixture.description, fixture ] )
	)( '%s', ( _description, fixture ) => {
		const notes = [];

		expect( convertLegacyBlocks( fixture.input, notes ) ).toEqual(
			fixture.expected
		);
		expect( [ ...new Set( notes ) ] ).toEqual( fixture.notes );
	} );

	it( 'keeps blocks without sliders as they are', () => {
		const block = {
			name: 'core/group',
			attributes: {},
			innerBlocks: [
				{ name: 'core/paragraph', attributes: {}, innerBlocks: [] },
			],
		};

		expect( convertLegacyBlocks( [ block ] )[ 0 ] ).toBe( block );
	} );
} );

describe( 'convertLegacySlider', () => {
	it( 'returns the carousel and the settings without an equivalent, once each', () => {
		const { block, notes } = convertLegacySlider( { width: '800' }, [
			{
				name: LEGACY_SLIDE,
				attributes: {},
				innerBlocks: [
					{
						name: LEGACY_SLIDER,
						attributes: { width: '600', height: '300' },
						innerBlocks: [],
					},
				],
			},
		] );

		expect( block.name ).toBe( 'outstand/carousel' );
		expect( notes ).toEqual( [ 'width', 'height' ] );
	} );
} );

describe( 'converted blocks', () => {
	const converted = collectCarouselBlocks(
		blockFixtures.flatMap( ( fixture ) => fixture.expected )
	);

	it.each( converted.map( ( block, index ) => [ index, block ] ) )(
		'block %i uses only the attributes and values the current block accepts',
		( _index, block ) => {
			const metadata = METADATA[ block.name ];
			const accepted = getAcceptedAttributes( metadata );
			const invalid = Object.entries( block.attributes ).filter(
				( [ name, value ] ) =>
					! accepted.includes( name ) ||
					! (
						metadata.attributes?.[ name ]?.enum ?? [ value ]
					).includes( value )
			);

			expect( invalid ).toEqual( [] );
		}
	);

	it( 'puts each block where the current block metadata allows it', () => {
		const misplaced = [];
		const check = ( blocks, parent ) =>
			blocks.forEach( ( block ) => {
				const allowedParents = METADATA[ block.name ]?.parent;
				const allowedChildren = METADATA[ parent ]?.allowedBlocks;

				if (
					( allowedParents && ! allowedParents.includes( parent ) ) ||
					( allowedChildren &&
						! allowedChildren.includes( block.name ) )
				) {
					misplaced.push( `${ parent } > ${ block.name }` );
				}

				check( block.innerBlocks ?? [], block.name );
			} );

		check(
			converted.filter( ( block ) => block.name === 'outstand/carousel' ),
			null
		);

		expect( misplaced ).toEqual( [] );
	} );
} );
