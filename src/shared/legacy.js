/**
 * Converts Slider Block (`pixelalbatross/slider`) blocks to Outstand Carousel blocks.
 *
 * A Slider Block slider holds `pixelalbatross/slide` blocks, and each slide holds
 * its content as inner blocks. The slider settings are attributes of the slider
 * block.
 *
 * `LegacyConverter` in PHP converts the same input to the same block tree for the
 * WP-CLI command and the front end. Both produce the results in
 * `tests/fixtures/legacy-attributes.json` and `tests/fixtures/legacy-blocks.json`.
 */

export const LEGACY_SLIDER = 'pixelalbatross/slider';
export const LEGACY_SLIDE = 'pixelalbatross/slide';

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
 * Builds a block spec.
 *
 * @param {string}   name        Block name.
 * @param {Object}   attributes  Block attributes.
 * @param {Object[]} innerBlocks Inner block specs or existing blocks.
 * @return {Object} Block spec.
 */
function spec( name, attributes = {}, innerBlocks = [] ) {
	return { name, attributes, innerBlocks };
}

/**
 * Returns the style and class attributes that both block versions support.
 *
 * @param {Object} attributes Slider Block attributes.
 * @return {Object} Shared attributes.
 */
function pickShared( attributes ) {
	return Object.fromEntries(
		Object.entries( attributes ?? {} ).filter( ( [ key ] ) =>
			SHARED_ATTRIBUTES.includes( key )
		)
	);
}

/**
 * Returns the slide attributes that both block versions support, including its URL hash.
 *
 * @param {Object} attributes Slider Block slide attributes.
 * @return {Object} Slide attributes.
 */
function pickSlide( attributes ) {
	const picked = pickShared( attributes );

	if ( attributes?.hash ) {
		picked.hash = attributes.hash;
	}

	return picked;
}

/**
 * Turns a Slider Block length into the pixel length Swiper used.
 *
 * Swiper read the number at the start of the value as pixels and ignored any unit.
 *
 * @param {unknown} value Slider Block value.
 * @return {string} CSS length in pixels, or an empty string for no length.
 */
function toPixels( value ) {
	if ( typeof value !== 'string' && typeof value !== 'number' ) {
		return '';
	}

	const quantity = parseFloat( String( value ).trim() );

	if ( ! Number.isFinite( quantity ) || quantity === 0 ) {
		return '';
	}

	return `${ quantity }px`;
}

/**
 * Maps Slider Block slider attributes to `outstand/carousel` attributes.
 *
 * The slide ratio, maximum slide height and image fit keep their defaults, so
 * images in slides keep their ratio, as in Slider Block.
 *
 * @param {Object} attributes Slider Block attributes.
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

	const gap = toPixels( attributes.spaceBetween );

	if ( gap ) {
		mapped.gap = gap;
	}

	// Swiper sizes a horizontal slider by its width only, so the height had no visible effect.
	if ( attributes.height ) {
		notes.push( 'height' );
	}

	if ( attributes.width ) {
		notes.push( 'width' );
	}

	if ( attributes.hashNavigation ) {
		mapped.hashNavigation = true;
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
			case 'progressbar':
				pagination = 'progress';
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
 * Converts one Slider Block slider into a tree of block specs.
 *
 * @param {Object}   attributes  Slider Block slider attributes.
 * @param {Object[]} innerBlocks Slider Block slide blocks.
 * @param {string[]} notes       Collects the settings that have no equivalent.
 * @return {Object} Spec of the `outstand/carousel` block.
 */
function convertSlider( attributes, innerBlocks, notes ) {
	const mapping = mapSliderAttributes( attributes ?? {} );

	notes.push( ...mapping.notes );

	const slides = ( innerBlocks ?? [] )
		.filter( ( block ) => block.name === LEGACY_SLIDE )
		.map( ( block ) =>
			spec(
				'outstand/slide',
				pickSlide( block.attributes ),
				convertLegacyBlocks( block.innerBlocks ?? [], notes )
			)
		);

	const children = [ spec( 'outstand/slides', {}, slides ) ];

	if ( mapping.navigation ) {
		children.push( spec( 'outstand/carousel-navigation' ) );
	}

	switch ( mapping.pagination ) {
		case 'dots':
			children.push( spec( 'outstand/carousel-pagination' ) );
			break;
		case 'progress':
			children.push(
				spec( 'outstand/carousel-pagination', { type: 'progress' } )
			);
			break;
		case 'counter':
			children.push( spec( 'outstand/carousel-counter' ) );
			break;
		default:
			break;
	}

	return spec( 'outstand/carousel', mapping.attributes, children );
}

/**
 * Converts the Slider Block sliders in a list of blocks, at any depth.
 *
 * Other blocks keep their attributes; only their inner blocks are checked.
 *
 * @param {Object[]} blocks Blocks.
 * @param {string[]} notes  Collects the settings that have no equivalent.
 * @return {Object[]} Blocks and specs.
 */
export function convertLegacyBlocks( blocks, notes = [] ) {
	return blocks.map( ( block ) => {
		if ( block.name === LEGACY_SLIDER ) {
			return convertSlider( block.attributes, block.innerBlocks, notes );
		}

		if ( ! block.innerBlocks?.length ) {
			return block;
		}

		const innerBlocks = convertLegacyBlocks( block.innerBlocks, notes );
		const hasChanged = innerBlocks.some(
			( innerBlock, index ) => innerBlock !== block.innerBlocks[ index ]
		);

		return hasChanged
			? spec( block.name, block.attributes, innerBlocks )
			: block;
	} );
}

/**
 * Converts a Slider Block slider into a tree of block specs.
 *
 * The slides move into an `outstand/slides` block. Inner blocks that are not
 * slides are dropped. Navigation, pagination and counter blocks follow the
 * slides when the slider settings show them. Content blocks stay as they are,
 * and the sliders inside them are converted too.
 *
 * @param {Object}   attributes  Slider Block slider attributes.
 * @param {Object[]} innerBlocks Slider Block slide blocks.
 * @return {{block: Object, notes: string[]}} Spec of the `outstand/carousel` block, and the settings that have no equivalent.
 */
export function convertLegacySlider( attributes, innerBlocks ) {
	const notes = [];
	const block = convertSlider( attributes, innerBlocks, notes );

	return { block, notes: [ ...new Set( notes ) ] };
}
