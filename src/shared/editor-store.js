/**
 * Editor-only store holding the slide each carousel shows in the canvas.
 *
 * Every carousel block reads and writes it, so the navigation, pagination and
 * counter blocks can move the slides block they sit next to.
 */
import { createReduxStore, register } from '@wordpress/data';

import { EDITOR_STORE } from '../hooks/use-carousel';

const store = createReduxStore( EDITOR_STORE, {
	reducer( state = {}, action ) {
		switch ( action.type ) {
			case 'SET_ACTIVE_SLIDE':
				if ( state[ action.carouselId ] === action.index ) {
					return state;
				}
				return { ...state, [ action.carouselId ]: action.index };
			default:
				return state;
		}
	},
	actions: {
		setActiveSlide( carouselId, index ) {
			return { type: 'SET_ACTIVE_SLIDE', carouselId, index };
		},
	},
	selectors: {
		getActiveSlide( state, carouselId ) {
			return state[ carouselId ] ?? 0;
		},
	},
} );

register( store );
