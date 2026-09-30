/**
 * Converts Slider Block (`pixelalbatross/slider`) blocks to Outstand Carousel blocks.
 *
 * Mirrors `LegacyConverter`, which the WP-CLI command uses. Both must produce
 * the results in `tests/fixtures/legacy-attributes.json`.
 */

const LEGACY_SPEED = 300;
const LEGACY_INTERVAL = 3000;
const SHARED_ATTRIBUTES = [
	'align',
	'className',
	'backgroundColor',
	'textColor',
	'gradient',
	'style',
];

/**
 * Returns the style and class attributes both block versions support.
 *
 * @param {Object} attributes Legacy attributes.
 * @return {Object} Shared attributes.
 */
function pickShared( attributes ) {
	return Object.fromEntries(
		Object.entries( attributes ).filter( ( [ key ] ) =>
			SHARED_ATTRIBUTES.includes( key )
		)
	);
}

/**
 * Turns a legacy Swiper length, a bare number of pixels or a CSS length, into a CSS length.
 *
 * @param {string|number|undefined} value Legacy value.
 * @return {string} CSS length, or an empty string when unset.
 */
function toLength( value ) {
	const trimmed = String( value ?? '' ).trim();

	if ( '' === trimmed ) {
		return '';
	}

	return /^-?\d+(\.\d+)?$/.test( trimmed ) ? `${ trimmed }px` : trimmed;
}

/**
 * Maps legacy slider attributes to `outstand/carousel` attributes.
 *
 * @param {Object} attributes Legacy attributes.
 * @return {{attributes: Object, navigation: boolean, pagination: ?string, notes: string[]}} Mapping.
 */
export function mapSliderAttributes( attributes ) {
	const mapped = pickShared( attributes );
	const notes = [];

	if ( attributes.ariaLabel ) {
		mapped.ariaLabel = attributes.ariaLabel;
	}

	if ( attributes.loop ) {
		mapped.type = 'loop';
	}

	if ( attributes.rewind ) {
		mapped.rewind = true;
	}

	if ( attributes.autoHeight ) {
		mapped.autoHeight = true;
	}

	const perPage = parseInt( attributes.perView ?? 1, 10 );

	if ( perPage > 1 ) {
		mapped.perPage = perPage;
	}

	if ( attributes.centerSlides ) {
		mapped.focusCenter = true;
	}

	if ( attributes.freeMode ) {
		mapped.freeDrag = true;
	}

	mapped.speed = parseInt( attributes.speed ?? LEGACY_SPEED, 10 );

	if ( attributes.autoplay ) {
		mapped.autoplay = true;
		mapped.interval = parseInt(
			attributes.autoplayInterval ?? LEGACY_INTERVAL,
			10
		);
		mapped.pauseOnHover = !! attributes.autoplayPauseOnHover;
	}

	const gap = toLength( attributes.spaceBetween );

	if ( gap ) {
		mapped.gap = gap;
	}

	const height = toLength( attributes.height );

	if ( height ) {
		mapped.height = height;
	}

	if ( attributes.width ) {
		notes.push( 'width' );
	}

	if ( attributes.hashNavigation ) {
		notes.push( 'hashNavigation' );
	}

	let pagination = null;

	if ( attributes.pagination ) {
		switch ( attributes.paginationType ?? 'bullets' ) {
			case 'bullets':
				pagination = 'dots';
				break;
			case 'fraction':
				pagination = 'counter';
				break;
			default:
				pagination = 'dots';
				notes.push( 'paginationType' );
				break;
		}
	}

	return {
		attributes: mapped,
		navigation: !! attributes.navigation,
		pagination,
		notes,
	};
}

/**
 * Converts a legacy slider into a tree of block specs.
 *
 * @param {Object}   attributes  Legacy slider attributes.
 * @param {Object[]} innerBlocks Legacy slide blocks.
 * @return {{block: Object, notes: string[]}} Spec of the `outstand/carousel` block, and the settings that have no equivalent.
 */
export function convertLegacySlider( attributes, innerBlocks ) {
	const {
		attributes: mapped,
		navigation,
		pagination,
		notes,
	} = mapSliderAttributes( attributes );

	const slides = innerBlocks
		.filter( ( block ) => block.name === 'pixelalbatross/slide' )
		.map( ( block ) => {
			if ( block.attributes.hash ) {
				notes.push( 'slideHash' );
			}

			return {
				name: 'outstand/slide',
				attributes: pickShared( block.attributes ),
				innerBlocks: block.innerBlocks,
			};
		} );

	const children = [
		{ name: 'outstand/slides', attributes: {}, innerBlocks: slides },
	];

	if ( navigation ) {
		children.push( {
			name: 'outstand/carousel-navigation',
			attributes: {},
			innerBlocks: [],
		} );
	}

	switch ( pagination ) {
		case 'dots':
			children.push( {
				name: 'outstand/carousel-pagination',
				attributes: {},
				innerBlocks: [],
			} );
			break;
		case 'counter':
			children.push( {
				name: 'outstand/carousel-counter',
				attributes: {},
				innerBlocks: [],
			} );
			break;
		default:
			break;
	}

	return {
		block: {
			name: 'outstand/carousel',
			attributes: mapped,
			innerBlocks: children,
		},
		notes: [ ...new Set( notes ) ],
	};
}
