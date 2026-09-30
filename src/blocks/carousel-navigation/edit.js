/**
 * Carousel Navigation block editor.
 */
import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	__experimentalVStack as VStack, // eslint-disable-line @wordpress/no-unsafe-wp-apis
} from '@wordpress/components';

import IconPicker from '../../components/icon-picker';
import RegistryIcon from '../../components/registry-icon';
import { useCarousel } from '../../hooks/use-carousel';
import { useIcons } from '../../hooks/use-icons';

const DEFAULT_PREVIOUS = 'core/arrow-left';
const DEFAULT_NEXT = 'core/arrow-right';
const ICON_CLASS = 'wp-block-outstand-carousel-navigation__icon';

export default function CarouselNavigationEdit( {
	attributes,
	setAttributes,
	clientId,
	context,
	__unstableLayoutClassNames: layoutClassNames,
} ) {
	const { previousIcon, nextIcon, iconSize } = attributes;
	const { activeIndex, canGoPrev, canGoNext, goTo } = useCarousel( clientId );
	const { icons } = useIcons();

	// Mirrors render.php: an unregistered icon falls back to the core arrow.
	const findIcon = ( name, fallback ) =>
		icons?.find( ( icon ) => icon.name === name ) ??
		icons?.find( ( icon ) => icon.name === fallback );
	const hasAutoplay = !! context[ 'outstand/carousel/autoplay' ];

	// The layout support only reaches blocks with inner blocks by itself.
	const blockProps = useBlockProps( { className: layoutClassNames } );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Icons', 'outstand-carousel' ) }>
					<VStack spacing={ 4 }>
						<IconPicker
							label={ __( 'Previous icon', 'outstand-carousel' ) }
							value={ previousIcon }
							onChange={ ( value ) =>
								setAttributes( { previousIcon: value } )
							}
						/>
						<IconPicker
							label={ __( 'Next icon', 'outstand-carousel' ) }
							value={ nextIcon }
							onChange={ ( value ) =>
								setAttributes( { nextIcon: value } )
							}
						/>
						<RangeControl
							__next40pxDefaultSize
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
						icon={ findIcon( previousIcon, DEFAULT_PREVIOUS ) }
						size={ iconSize }
						className={ ICON_CLASS }
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
							icon={ findIcon( 'outstand-carousel/play' ) }
							size={ iconSize }
							className={ `${ ICON_CLASS } is-play` }
						/>
						<RegistryIcon
							icon={ findIcon( 'outstand-carousel/pause' ) }
							size={ iconSize }
							className={ `${ ICON_CLASS } is-pause` }
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
						icon={ findIcon( nextIcon, DEFAULT_NEXT ) }
						size={ iconSize }
						className={ ICON_CLASS }
					/>
				</button>
			</div>
		</>
	);
}
