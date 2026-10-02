/**
 * Backdrop item for the Background panel of a slide: a bordered item that
 * opens the backdrop options in a popover, styled with core's classes for the
 * items of that panel.
 */
import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import {
	Button,
	Dropdown,
	FlexItem,
	Icon,
	__experimentalDropdownContentWrapper as DropdownContentWrapper, // eslint-disable-line @wordpress/no-unsafe-wp-apis
	__experimentalHStack as HStack, // eslint-disable-line @wordpress/no-unsafe-wp-apis
	__experimentalText as Text, // eslint-disable-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl as ToggleGroupControl, // eslint-disable-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption as ToggleGroupControlOption, // eslint-disable-line @wordpress/no-unsafe-wp-apis
	__experimentalToolsPanelItem as ToolsPanelItem, // eslint-disable-line @wordpress/no-unsafe-wp-apis
} from '@wordpress/components';
import { useRef } from '@wordpress/element';
import { background, reset } from '@wordpress/icons';

const POPOVER_PROPS = { placement: 'left-start', offset: 36, shift: true };

/**
 * Renders the backdrop item.
 *
 * @param {Object}                  props          Component props.
 * @param {string}                  props.value    Backdrop, such as "blur", or empty for none.
 * @param {(value: string) => void} props.onChange Backdrop setter.
 * @param {string}                  props.clientId Block client ID.
 * @return {Element} Item.
 */
export default function BackdropControl( { value, onChange, clientId } ) {
	const toggleRef = useRef();
	const options = [
		{ value: '', label: __( 'None', 'outstand-carousel' ) },
		{ value: 'blur', label: __( 'Blurred image', 'outstand-carousel' ) },
	];
	const current = options.find( ( option ) => option.value === value );

	return (
		<InspectorControls group="background">
			<ToolsPanelItem
				className="block-editor-color-gradient-item block-editor-tools-panel-color-gradient-settings__item"
				label={ __( 'Backdrop', 'outstand-carousel' ) }
				hasValue={ () => !! value }
				onDeselect={ () => onChange( '' ) }
				resetAllFilter={ () => ( { backdrop: '' } ) }
				isShownByDefault
				panelId={ clientId }
			>
				<Dropdown
					popoverProps={ POPOVER_PROPS }
					className="block-editor-tools-panel-color-gradient-settings__dropdown"
					renderToggle={ ( { onToggle, isOpen } ) => (
						<>
							<Button
								__next40pxDefaultSize
								ref={ toggleRef }
								className={ `block-editor-panel-color-gradient-settings__dropdown${
									isOpen ? ' is-open' : ''
								}` }
								onClick={ onToggle }
								aria-expanded={ isOpen }
							>
								<HStack justify="flex-start">
									<Icon icon={ background } size={ 24 } />
									<FlexItem className="block-editor-panel-color-gradient-settings__color-name">
										{ __(
											'Backdrop',
											'outstand-carousel'
										) }
									</FlexItem>
									{ !! value && (
										<Text variant="muted">
											{ current?.label }
										</Text>
									) }
								</HStack>
							</Button>
							{ !! value && (
								<Button
									__next40pxDefaultSize
									label={ __( 'Reset', 'outstand-carousel' ) }
									className="block-editor-panel-color-gradient-settings__reset"
									size="small"
									icon={ reset }
									onClick={ () => {
										onChange( '' );
										toggleRef.current?.focus();
									} }
								/>
							) }
						</>
					) }
					renderContent={ () => (
						<DropdownContentWrapper
							paddingSize="medium"
							className="block-editor-global-styles-background-panel__dropdown-content-wrapper"
						>
							<ToggleGroupControl
								label={ __( 'Backdrop', 'outstand-carousel' ) }
								help={ __(
									'What shows around the slide image when it doesn’t fill the slide.',
									'outstand-carousel'
								) }
								value={ value || '' }
								onChange={ ( next ) => onChange( next ?? '' ) }
								isBlock
							>
								{ options.map( ( option ) => (
									<ToggleGroupControlOption
										key={ option.value }
										value={ option.value }
										label={ option.label }
									/>
								) ) }
							</ToggleGroupControl>
						</DropdownContentWrapper>
					) }
				/>
			</ToolsPanelItem>
		</InspectorControls>
	);
}
