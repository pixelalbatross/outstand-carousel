/**
 * Reads the icons registered with the WordPress icon registry.
 */
import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';

/**
 * Returns the registered icons from the core `root/icon` entity, shared with
 * the core Icon block.
 *
 * @param {string} [collection] Collection slug to limit the list to.
 * @return {{icons: Object[]|null, isResolving: boolean}} Icons with name, label, content and collection.
 */
export function useIcons( collection ) {
	return useSelect(
		( select ) => {
			const query = collection ? { collection } : {};
			const store = select( coreStore );

			return {
				icons: store.getEntityRecords( 'root', 'icon', query ),
				isResolving: ! store.hasFinishedResolution(
					'getEntityRecords',
					[ 'root', 'icon', query ]
				),
			};
		},
		[ collection ]
	);
}
