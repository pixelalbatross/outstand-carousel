import { describe, it, expect } from 'vitest';

import { mapSliderAttributes, convertLegacySlider } from './legacy';
import fixtures from '../../tests/fixtures/legacy-attributes.json';

describe( 'mapSliderAttributes', () => {
	it.each( fixtures.map( ( fixture ) => [ fixture.description, fixture ] ) )(
		'%s',
		( _description, fixture ) => {
			expect( mapSliderAttributes( fixture.attributes ) ).toEqual(
				fixture.expected
			);
		}
	);
} );

describe( 'convertLegacySlider', () => {
	it( 'moves slides and their content into a slides block', () => {
		const content = [
			{
				name: 'core/paragraph',
				attributes: { content: 'Slide' },
				innerBlocks: [],
			},
		];
		const { block, notes } = convertLegacySlider( { navigation: true }, [
			{
				name: 'pixelalbatross/slide',
				attributes: { hash: 'first', className: 'is-first' },
				innerBlocks: content,
			},
			{ name: 'core/paragraph', attributes: {}, innerBlocks: [] },
		] );

		expect( block.name ).toBe( 'outstand/carousel' );
		expect( block.innerBlocks.map( ( child ) => child.name ) ).toEqual( [
			'outstand/slides',
			'outstand/carousel-navigation',
		] );
		expect( block.innerBlocks[ 0 ].innerBlocks ).toEqual( [
			{
				name: 'outstand/slide',
				attributes: { className: 'is-first', hash: 'first' },
				innerBlocks: content,
			},
		] );
		expect( notes ).toEqual( [] );
	} );

	it( 'turns progress bar pagination into a progress pagination block', () => {
		const { block } = convertLegacySlider(
			{ pagination: true, paginationType: 'progressbar' },
			[]
		);

		expect( block.innerBlocks[ 1 ] ).toEqual( {
			name: 'outstand/carousel-pagination',
			attributes: { type: 'progress' },
			innerBlocks: [],
		} );
	} );
} );
