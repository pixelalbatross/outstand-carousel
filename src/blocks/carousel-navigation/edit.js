/**
 * Carousel Navigation block editor.
 */
import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import {
	ComboboxControl,
	PanelBody,
	RangeControl,
	__experimentalVStack as VStack, // eslint-disable-line @wordpress/no-unsafe-wp-apis
} from '@wordpress/components';

import { useIcons } from '../../hooks/use-icons';
import { useCarousel } from '../../hooks/use-carousel';

/**
 * Shows an icon from the registry, or nothing while icons load.
 *
 * @param {Object} props         Component props.
 * @param {string} props.content Sanitized SVG markup from the icon registry.
 * @param {string} props.variant Extra class for the play and pause icons.
 * @return {Element|null} Icon.
 */
function RegistryIcon( { content, variant } ) {
	if ( ! content ) {
		return null;
	}

	return (
		<span
			className={ `wp-block-outstand-carousel-navigation__icon ${ variant ?? '' }` }
			dangerouslySetInnerHTML={ { __html: content } }
		/>
	);
}

export default function CarouselNavigationEdit( {
	attributes,
	setAttributes,
	clientId,
	context,
	__unstableLayoutClassNames: layoutClassNames,
} ) {
	const { previousIcon, nextIcon, iconSize } = attributes;
	const { activeIndex, canGoPrev, canGoNext, goTo } = useCarousel( clientId );
	const icons = useIcons();

	const getContent = ( name, fallback ) =>
		(
			icons.find( ( icon ) => icon.name === name ) ??
			icons.find( ( icon ) => icon.name === fallback )
		)?.content;
	const iconOptions = icons.map( ( icon ) => ( {
		value: icon.name,
		label: `${ icon.label } (${ icon.name })`,
	} ) );
	const hasAutoplay = !! context[ 'outstand/carousel/autoplay' ];

	// The layout support only reaches blocks with inner blocks by itself.
	const blockProps = useBlockProps( {
		className: layoutClassNames,
		style: { '--outstand-carousel-icon-size': `${ iconSize }px` },
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Icons', 'outstand-carousel' ) }>
					<VStack spacing={ 4 }>
						<ComboboxControl
							label={ __( 'Previous icon', 'outstand-carousel' ) }
							value={ previousIcon }
							options={ iconOptions }
							onChange={ ( value ) =>
								setAttributes( {
									previousIcon: value || 'core/arrow-left',
								} )
							}
						/>
						<ComboboxControl
							label={ __( 'Next icon', 'outstand-carousel' ) }
							value={ nextIcon }
							options={ iconOptions }
							onChange={ ( value ) =>
								setAttributes( {
									nextIcon: value || 'core/arrow-right',
								} )
							}
						/>
						<RangeControl
							label={ __(
								'Icon size (px)',
								'outstand-carousel'
							) }
							value={ iconSize }
							min={ 12 }
							max={ 64 }
							onChange={ ( value ) =>
								setAttributes( { iconSize: value ?? 24 } )
							}
						/>
					</VStack>
				</PanelBody>
			</InspectorControls>
			<div { ...blockProps }>
				<button
					type="button"
					className="wp-block-outstand-carousel-navigation__button is-previous"
					aria-label={ __( 'Previous slide', 'outstand-carousel' ) }
					disabled={ ! canGoPrev }
					onClick={ () => goTo( activeIndex - 1 ) }
				>
					<RegistryIcon
						content={ getContent(
							previousIcon,
							'core/arrow-left'
						) }
					/>
				</button>
				{ hasAutoplay && (
					<button
						type="button"
						className="wp-block-outstand-carousel-navigation__button is-toggle is-playing"
						aria-label={ __(
							'Pause autoplay',
							'outstand-carousel'
						) }
					>
						<RegistryIcon
							content={ getContent( 'outstand-carousel/pause' ) }
							variant="is-pause"
						/>
					</button>
				) }
				<button
					type="button"
					className="wp-block-outstand-carousel-navigation__button is-next"
					aria-label={ __( 'Next slide', 'outstand-carousel' ) }
					disabled={ ! canGoNext }
					onClick={ () => goTo( activeIndex + 1 ) }
				>
					<RegistryIcon
						content={ getContent( nextIcon, 'core/arrow-right' ) }
					/>
				</button>
			</div>
		</>
	);
}
