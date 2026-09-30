/**
 * Reads the carousel a block belongs to: its attributes, slides and the slide
 * shown in the canvas.
 */
import { useSelect, useDispatch } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { useCallback } from '@wordpress/element';

export const EDITOR_STORE = 'outstand/carousel-editor';

const EMPTY = [];
const EMPTY_ATTRIBUTES = {};

/**
 * Finds the first block with a given name, depth first.
 *
 * @param {Object[]} blocks Blocks to search.
 * @param {string}   name   Block name.
 * @return {Object|undefined} Matching block.
 */
function findBlock( blocks, name ) {
	for ( const block of blocks ) {
		if ( block.name === name ) {
			return block;
		}

		const found = findBlock( block.innerBlocks, name );

		if ( found ) {
			return found;
		}
	}

	return undefined;
}

/**
 * Returns the carousel state for a block inside a carousel, or for the carousel itself.
 *
 * @param {string} clientId Block client ID.
 * @return {Object} Carousel state and a setter for the slide shown.
 */
export function useCarousel( clientId ) {
	const carousel = useSelect(
		( select ) => {
			const { getBlock, getBlockName, getBlockParentsByBlockName } =
				select( blockEditorStore );
			const carouselId =
				getBlockName( clientId ) === 'outstand/carousel'
					? clientId
					: getBlockParentsByBlockName(
							clientId,
							'outstand/carousel',
							true
						)[ 0 ];

			if ( ! carouselId ) {
				return {
					carouselId: null,
					slidesId: null,
					slides: EMPTY,
					activeIndex: 0,
					attributes: EMPTY_ATTRIBUTES,
				};
			}

			const carouselBlock = getBlock( carouselId );
			const slidesBlock = findBlock(
				carouselBlock?.innerBlocks ?? EMPTY,
				'outstand/slides'
			);
			const slides = slidesBlock?.innerBlocks ?? EMPTY;
			const activeIndex = Math.min(
				select( EDITOR_STORE ).getActiveSlide( carouselId ),
				Math.max( 0, slides.length - 1 )
			);

			return {
				carouselId,
				slidesId: slidesBlock?.clientId ?? null,
				slides,
				activeIndex,
				attributes: carouselBlock?.attributes ?? EMPTY_ATTRIBUTES,
			};
		},
		[ clientId ]
	);

	const { setActiveSlide } = useDispatch( EDITOR_STORE );
	const { carouselId, slides, attributes } = carousel;
	const total = slides.length;
	const isLooping = attributes.type === 'loop' || !! attributes.rewind;
	const perPage =
		attributes.type === 'fade' ? 1 : Math.max( 1, attributes.perPage ?? 1 );
	const endIndex =
		attributes.type === 'slide' && ! attributes.focusCenter
			? Math.max( 0, total - perPage )
			: total - 1;

	const goTo = useCallback(
		( index ) => {
			if ( ! carouselId || ! total ) {
				return;
			}

			const last = Math.max( 0, endIndex );
			let next = index;

			if ( next < 0 ) {
				next = isLooping ? last : 0;
			} else if ( next > last ) {
				next = isLooping ? 0 : last;
			}

			setActiveSlide( carouselId, next );
		},
		[ carouselId, total, endIndex, isLooping, setActiveSlide ]
	);

	return {
		...carousel,
		total,
		perPage,
		endIndex,
		canGoPrev: isLooping || carousel.activeIndex > 0,
		canGoNext: isLooping || carousel.activeIndex < endIndex,
		goTo,
	};
}

/**
 * Returns the URL of the image that represents a slide in the editor.
 *
 * Mirrors `Slides::get_media_id()`: the first image or cover, else the
 * slide's background image.
 *
 * @param {Object} slide `outstand/slide` block.
 * @return {string|undefined} Image URL.
 */
export function getSlideImageUrl( slide ) {
	const media = findMedia( slide.innerBlocks );

	return media ?? slide.attributes?.style?.background?.backgroundImage?.url;
}

/**
 * Finds the first image or cover URL, depth first.
 *
 * @param {Object[]} blocks Blocks to search.
 * @return {string|undefined} Image URL.
 */
function findMedia( blocks ) {
	for ( const block of blocks ) {
		if (
			[ 'core/image', 'core/cover' ].includes( block.name ) &&
			block.attributes.url
		) {
			return block.attributes.url;
		}

		const found = findMedia( block.innerBlocks );

		if ( found ) {
			return found;
		}
	}

	return undefined;
}
