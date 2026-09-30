/**
 * Reads the icons registered with the WordPress icon registry.
 */
import apiFetch from '@wordpress/api-fetch';
import { useEffect, useState } from '@wordpress/element';

let request;

/**
 * Fetches every registered icon once per page load.
 *
 * @return {Promise<Object[]>} Icons with name, label and SVG content.
 */
function fetchIcons() {
	if ( ! request ) {
		request = apiFetch( { path: '/wp/v2/icons' } ).catch( () => [] );
	}

	return request;
}

/**
 * Returns the registered icons, or an empty list while they load.
 *
 * @return {Object[]} Icons with name, label and SVG content.
 */
export function useIcons() {
	const [ icons, setIcons ] = useState( [] );

	useEffect( () => {
		let isMounted = true;

		fetchIcons().then( ( result ) => {
			if ( isMounted ) {
				setIcons( Array.isArray( result ) ? result : [] );
			}
		} );

		return () => {
			isMounted = false;
		};
	}, [] );

	return icons;
}
