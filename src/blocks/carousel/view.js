/**
 * Mounts Splide on each carousel and connects the navigation, pagination and
 * counter blocks to it.
 */
import { store, getContext, getElement } from '@wordpress/interactivity';
import { Splide } from '@splidejs/splide';

import { formatCounter } from '../../shared/counter';

/**
 * Mounted Splide instances, by carousel ID.
 *
 * @type {Map<string, Splide>}
 */
const carousels = new Map();

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
			const splide = new Splide( ref, context.options );

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

			splide.mount();
			carousels.set( context.id, splide );

			return () => {
				splide.destroy();
				carousels.delete( context.id );
			};
		},
	},
} );
