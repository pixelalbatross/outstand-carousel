/**
 * A control that picks a registered icon from a searchable, scrolling grid.
 *
 * Core's own icon picker (`IconPickerModal`) is a private component that
 * plugins can't import.
 */
import {
	BaseControl,
	Button,
	Notice,
	SearchControl,
	Spinner,
	Tooltip,
	useBaseControlProps,
	__experimentalGrid as Grid, // eslint-disable-line @wordpress/no-unsafe-wp-apis
	__experimentalText as Text, // eslint-disable-line @wordpress/no-unsafe-wp-apis
	__experimentalVStack as VStack, // eslint-disable-line @wordpress/no-unsafe-wp-apis
} from '@wordpress/components';
import { useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

import RegistryIcon from '../registry-icon';
import { useIcons } from '../../hooks/use-icons';
import './editor.scss';

/**
 * Returns the icons whose name or label contains the search term.
 *
 * @param {Object[]} icons  Icon records.
 * @param {string}   search Search term.
 * @return {Object[]} Matching icons.
 */
function filterIcons( icons, search ) {
	const term = search.trim().toLowerCase();

	if ( '' === term ) {
		return icons;
	}

	return icons.filter( ( icon ) =>
		`${ icon.name } ${ icon.label }`.toLowerCase().includes( term )
	);
}

/**
 * Searchable grid of icons.
 *
 * @param {Object}                 props          Component props.
 * @param {Object[]}               props.icons    Icon records.
 * @param {string}                 props.value    Selected icon name.
 * @param {(name: string) => void} props.onSelect Called with the picked icon name.
 * @return {Element} Grid.
 */
function IconGrid( { icons, value, onSelect } ) {
	const [ search, setSearch ] = useState( '' );
	const gridRef = useRef();
	const filtered = useMemo(
		() => filterIcons( icons, search ),
		[ icons, search ]
	);

	// The grid scrolls, so bring the selected icon into view when it mounts.
	useEffect( () => {
		const grid = gridRef.current;
		const pressed = grid?.querySelector( '.is-pressed' );

		if ( pressed ) {
			grid.scrollTop = pressed.offsetTop - grid.offsetTop;
		}
	}, [] );

	return (
		<VStack spacing={ 3 }>
			<SearchControl
				label={ __( 'Search icons', 'outstand-carousel' ) }
				value={ search }
				onChange={ setSearch }
			/>
			{ filtered.length ? (
				<Grid
					ref={ gridRef }
					className="outstand-carousel-icon-picker__grid"
					columns={ 6 }
					gap={ 1 }
				>
					{ filtered.map( ( icon ) => (
						<Tooltip key={ icon.name } text={ icon.label }>
							<Button
								className="outstand-carousel-icon-picker__item"
								label={ icon.label }
								isPressed={ icon.name === value }
								onClick={ () => onSelect( icon.name ) }
							>
								<RegistryIcon icon={ icon } size={ 20 } />
							</Button>
						</Tooltip>
					) ) }
				</Grid>
			) : (
				<Text variant="muted">
					{ __( 'No icons match your search.', 'outstand-carousel' ) }
				</Text>
			) }
		</VStack>
	);
}

/**
 * Icon picker control.
 *
 * @param {Object}                 props              Component props.
 * @param {string}                 props.label        Field label.
 * @param {string}                 props.value        Selected icon name, such as `core/arrow-left`.
 * @param {(name: string) => void} props.onChange     Called with the new icon name.
 * @param {string}                 [props.collection] Collection slug to limit the list to.
 * @return {Element} Control.
 */
export default function IconPicker( { label, value, onChange, collection } ) {
	const { icons, isResolving } = useIcons( collection );
	const selected = icons?.find( ( icon ) => icon.name === value );
	const { baseControlProps } = useBaseControlProps( {
		label,
		help: selected
			? sprintf(
					/* translators: %s: icon label. */
					__( 'Selected: %s', 'outstand-carousel' ),
					selected.label
				)
			: undefined,
	} );

	if ( isResolving || ! icons ) {
		return (
			<BaseControl { ...baseControlProps }>
				<Spinner />
			</BaseControl>
		);
	}

	if ( ! icons.length ) {
		return (
			<BaseControl { ...baseControlProps }>
				<Notice status="warning" isDismissible={ false }>
					{ __( 'No icons are registered.', 'outstand-carousel' ) }
				</Notice>
			</BaseControl>
		);
	}

	return (
		<BaseControl { ...baseControlProps }>
			<IconGrid icons={ icons } value={ value } onSelect={ onChange } />
		</BaseControl>
	);
}
