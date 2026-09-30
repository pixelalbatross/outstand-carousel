/**
 * Carousel block editor.
 */
import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import {
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
	__experimentalUnitControl as UnitControl, // eslint-disable-line @wordpress/no-unsafe-wp-apis
	__experimentalVStack as VStack, // eslint-disable-line @wordpress/no-unsafe-wp-apis
} from '@wordpress/components';

const TEMPLATE = [
	[ 'outstand/slides' ],
	[ 'outstand/carousel-navigation' ],
	[ 'outstand/carousel-pagination' ],
];

export default function CarouselEdit( { attributes, setAttributes } ) {
	const {
		type,
		perPage,
		perPageMobile,
		gap,
		height,
		speed,
		rewind,
		autoHeight,
		focusCenter,
		freeDrag,
		autoplay,
		interval,
		pauseOnHover,
		hashNavigation,
	} = attributes;

	const isFade = 'fade' === type;

	const blockProps = useBlockProps( {
		className: 'splide',
		style: {
			'--outstand-carousel-per-page': isFade ? 1 : perPage,
			'--outstand-carousel-gap': gap || undefined,
			'--outstand-carousel-height': height || undefined,
		},
	} );
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: TEMPLATE,
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Settings', 'outstand-carousel' ) }>
					<VStack spacing={ 4 }>
						<SelectControl
							label={ __( 'Type', 'outstand-carousel' ) }
							value={ type }
							options={ [
								{
									value: 'slide',
									label: __( 'Slide', 'outstand-carousel' ),
								},
								{
									value: 'loop',
									label: __( 'Loop', 'outstand-carousel' ),
								},
								{
									value: 'fade',
									label: __( 'Fade', 'outstand-carousel' ),
								},
							] }
							help={ __(
								'Loop repeats the slides endlessly. Fade shows one slide at a time.',
								'outstand-carousel'
							) }
							onChange={ ( value ) =>
								setAttributes( { type: value } )
							}
						/>
						{ ! isFade && (
							<>
								<RangeControl
									label={ __(
										'Slides per page',
										'outstand-carousel'
									) }
									value={ perPage }
									min={ 1 }
									max={ 6 }
									onChange={ ( value ) =>
										setAttributes( { perPage: value ?? 1 } )
									}
								/>
								<RangeControl
									label={ __(
										'Slides per page on mobile',
										'outstand-carousel'
									) }
									help={ __(
										'Screens up to 781px wide. Leave empty to use the value above.',
										'outstand-carousel'
									) }
									value={ perPageMobile }
									min={ 1 }
									max={ 6 }
									allowReset
									onChange={ ( value ) =>
										setAttributes( {
											perPageMobile: value,
										} )
									}
								/>
								<UnitControl
									label={ __(
										'Gap between slides',
										'outstand-carousel'
									) }
									value={ gap }
									onChange={ ( value ) =>
										setAttributes( { gap: value ?? '' } )
									}
								/>
							</>
						) }
						<UnitControl
							label={ __( 'Slide height', 'outstand-carousel' ) }
							help={ __(
								'Leave empty to fit the content.',
								'outstand-carousel'
							) }
							value={ height }
							onChange={ ( value ) =>
								setAttributes( { height: value ?? '' } )
							}
						/>
						<RangeControl
							label={ __(
								'Transition speed (ms)',
								'outstand-carousel'
							) }
							value={ speed }
							min={ 0 }
							max={ 3000 }
							step={ 50 }
							onChange={ ( value ) =>
								setAttributes( { speed: value ?? 400 } )
							}
						/>
						{ 'slide' === type && (
							<ToggleControl
								label={ __( 'Rewind', 'outstand-carousel' ) }
								help={ __(
									'Go back to the first slide after the last one.',
									'outstand-carousel'
								) }
								checked={ rewind }
								onChange={ ( value ) =>
									setAttributes( { rewind: value } )
								}
							/>
						) }
						{ ! isFade && (
							<>
								<ToggleControl
									label={ __(
										'Center the active slide',
										'outstand-carousel'
									) }
									checked={ focusCenter }
									onChange={ ( value ) =>
										setAttributes( { focusCenter: value } )
									}
								/>
								<ToggleControl
									label={ __(
										'Free drag',
										'outstand-carousel'
									) }
									help={ __(
										'Dragging does not snap to a slide.',
										'outstand-carousel'
									) }
									checked={ freeDrag }
									onChange={ ( value ) =>
										setAttributes( { freeDrag: value } )
									}
								/>
							</>
						) }
						<ToggleControl
							label={ __(
								'Fit the height to each slide',
								'outstand-carousel'
							) }
							checked={ autoHeight }
							onChange={ ( value ) =>
								setAttributes( { autoHeight: value } )
							}
						/>
						<ToggleControl
							label={ __(
								'Hash navigation',
								'outstand-carousel'
							) }
							help={ __(
								'Link to a slide with a URL hash, such as #team. Set each hash in the slide settings.',
								'outstand-carousel'
							) }
							checked={ hashNavigation }
							onChange={ ( value ) =>
								setAttributes( { hashNavigation: value } )
							}
						/>
					</VStack>
				</PanelBody>
				<PanelBody
					title={ __( 'Autoplay', 'outstand-carousel' ) }
					initialOpen={ autoplay }
				>
					<VStack spacing={ 4 }>
						<ToggleControl
							label={ __( 'Autoplay', 'outstand-carousel' ) }
							help={ __(
								'The navigation block shows a play/pause button.',
								'outstand-carousel'
							) }
							checked={ autoplay }
							onChange={ ( value ) =>
								setAttributes( { autoplay: value } )
							}
						/>
						{ autoplay && (
							<>
								<RangeControl
									label={ __(
										'Interval (ms)',
										'outstand-carousel'
									) }
									value={ interval }
									min={ 1000 }
									max={ 20000 }
									step={ 500 }
									onChange={ ( value ) =>
										setAttributes( {
											interval: value ?? 5000,
										} )
									}
								/>
								<ToggleControl
									label={ __(
										'Pause on hover',
										'outstand-carousel'
									) }
									checked={ pauseOnHover }
									onChange={ ( value ) =>
										setAttributes( { pauseOnHover: value } )
									}
								/>
							</>
						) }
					</VStack>
				</PanelBody>
			</InspectorControls>
			<div { ...innerBlocksProps } />
		</>
	);
}
