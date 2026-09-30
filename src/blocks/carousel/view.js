/**
 * Mounts Splide on each carousel and connects the navigation, pagination and
 * counter blocks to it.
 */
import { store, getContext, getElement } from '@wordpress/interactivity';
import { Splide } from '@splidejs/splide';

import { formatCounter, formatProgress } from '../../shared/counter';

/**
 * Mounted Splide instances, by carousel ID.
 *
 * @type {Map<string, Splide>}
 */
const carousels = new Map();

/**
 * Returns a carousel's own slides, before Splide adds its loop clones.
 *
 * @param {HTMLElement} root Carousel element.
 * @return {HTMLElement[]} Slides.
 */
const getSlides = ( root ) =>
	[ ...( root.querySelector( '.splide__list' )?.children ?? [] ) ].filter(
		( element ) => element.classList.contains( 'splide__slide' )
	);

/**
 * Returns the index of the slide whose `data-hash` matches a URL hash.
 *
 * @param {HTMLElement[]} slides Slides.
 * @param {string}        hash   URL hash, with the leading `#`.
 * @return {number} Slide index, or -1.
 */
const findSlideByHash = ( slides, hash ) => {
	const target = decodeURIComponent( hash.replace( /^#/, '' ) );

	if ( ! target ) {
		return -1;
	}

	return slides.findIndex( ( slide ) => slide.dataset.hash === target );
};

const { state } = store( 'outstand/carousel', {
	state: {
		get isActive() {
			const context = getContext();
			return context.index === context.activeIndex;
		},
		get canGoPrev() {
			const context = getContext();
			return context.isLooping || context.activeIndex > 0;
		},
		get canGoNext() {
			const context = getContext();
			return context.isLooping || context.activeIndex < context.endIndex;
		},
		get counter() {
			const context = getContext();
			return formatCounter(
				context.activeIndex + 1,
				context.total,
				context.separator,
				context.padNumbers
			);
		},
		get progress() {
			const context = getContext();
			return formatProgress( context.activeIndex, context.total );
		},
		get autoplayLabel() {
			const context = getContext();
			return context.isPlaying ? state.i18n.pause : state.i18n.play;
		},
	},
	actions: {
		prev() {
			carousels.get( getContext().id )?.go( '<' );
		},
		next() {
			carousels.get( getContext().id )?.go( '>' );
		},
		goTo() {
			const context = getContext();
			carousels.get( context.id )?.go( context.index );
		},
		toggleAutoplay() {
			const context = getContext();
			const autoplay = carousels.get( context.id )?.Components.Autoplay;

			if ( ! autoplay ) {
				return;
			}

			if ( autoplay.isPaused() ) {
				autoplay.play();
			} else {
				autoplay.pause();
			}
		},
	},
	callbacks: {
		init() {
			const context = getContext();
			const { ref } = getElement();
			const slides = getSlides( ref );
			const hashIndex = context.hashNavigation
				? findSlideByHash( slides, window.location.hash )
				: -1;
			const splide = new Splide( ref, {
				...context.options,
				start: Math.max( 0, hashIndex ),
			} );

			splide.on( 'mounted move', () => {
				context.activeIndex = splide.index;
			} );
			splide.on( 'mounted updated end_index:changed', () => {
				context.endIndex = splide.Components.Controller.getEnd();
			} );
			splide.on( 'autoplay:play', () => {
				context.isPlaying = true;
			} );
			splide.on( 'autoplay:pause', () => {
				context.isPlaying = false;
			} );

			// The URL follows the active slide, and a changed hash moves the carousel.
			const onHashChange = () => {
				const index = findSlideByHash( slides, window.location.hash );

				if ( index >= 0 && index !== splide.index ) {
					splide.go( index );
				}
			};

			if ( context.hashNavigation ) {
				splide.on( 'moved', () => {
					const hash = slides[ splide.index ]?.dataset.hash;

					if ( hash && window.location.hash !== `#${ hash }` ) {
						window.history.replaceState( null, '', `#${ hash }` );
					}
				} );
				window.addEventListener( 'hashchange', onHashChange );
			}

			splide.mount();
			carousels.set( context.id, splide );

			return () => {
				window.removeEventListener( 'hashchange', onHashChange );
				splide.destroy();
				carousels.delete( context.id );
			};
		},
	},
} );
