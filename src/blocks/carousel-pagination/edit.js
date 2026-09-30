/**
 * Carousel Pagination block editor.
 */
import clsx from 'clsx';
import { __, sprintf } from '@wordpress/i18n';
import {
	InspectorControls,
	store as blockEditorStore,
	useBlockProps,
} from '@wordpress/block-editor';
import {
	PanelBody,
	SelectControl,
	__experimentalVStack as VStack, // eslint-disable-line @wordpress/no-unsafe-wp-apis
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';

import { getSlideImageUrl, useCarousel } from '../../hooks/use-carousel';

export default function CarouselPaginationEdit( {
	attributes,
	setAttributes,
	clientId,
	__unstableLayoutClassNames: layoutClassNames,
} ) {
	const { type, thumbnailSize } = attributes;
	const { slides, activeIndex, goTo } = useCarousel( clientId );
	const imageSizes = useSelect(
		( select ) => select( blockEditorStore ).getSettings().imageSizes ?? [],
		[]
	);

	// The layout support only reaches blocks with inner blocks by itself.
	const blockProps = useBlockProps( {
		className: clsx( layoutClassNames, `is-type-${ type }` ),
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Settings', 'outstand-carousel' ) }>
					<VStack spacing={ 4 }>
						<SelectControl
							label={ __( 'Show as', 'outstand-carousel' ) }
							value={ type }
							options={ [
								{
									value: 'dots',
									label: __( 'Dots', 'outstand-carousel' ),
								},
								{
									value: 'thumbnails',
									label: __(
										'Thumbnails',
										'outstand-carousel'
									),
								},
							] }
							help={
								'thumbnails' === type
									? __(
											"Each thumbnail shows the slide's first image.",
											'outstand-carousel'
										)
									: undefined
							}
							onChange={ ( value ) =>
								setAttributes( { type: value } )
							}
						/>
						{ 'thumbnails' === type && (
							<SelectControl
								label={ __(
									'Thumbnail size',
									'outstand-carousel'
								) }
								value={ thumbnailSize }
								options={ imageSizes.map( ( size ) => ( {
									value: size.slug,
									label: size.name,
								} ) ) }
								onChange={ ( value ) =>
									setAttributes( { thumbnailSize: value } )
								}
							/>
						) }
					</VStack>
				</PanelBody>
			</InspectorControls>
			<ul { ...blockProps }>
				{ slides.map( ( slide, index ) => {
					const imageUrl =
						'thumbnails' === type
							? getSlideImageUrl( slide )
							: undefined;

					return (
						<li
							key={ slide.clientId }
							className="wp-block-outstand-carousel-pagination__entry"
						>
							<button
								type="button"
								className={ clsx(
									'wp-block-outstand-carousel-pagination__item',
									{
										'is-active': index === activeIndex,
									}
								) }
								aria-label={ sprintf(
									/* translators: %d: slide number. */
									__( 'Go to slide %d', 'outstand-carousel' ),
									index + 1
								) }
								aria-current={ index === activeIndex }
								onClick={ () => goTo( index ) }
							>
								{ 'thumbnails' === type && imageUrl && (
									<img
										className="wp-block-outstand-carousel-pagination__image"
										src={ imageUrl }
										alt=""
									/>
								) }
								{ 'thumbnails' === type && ! imageUrl && (
									<span className="wp-block-outstand-carousel-pagination__number">
										{ index + 1 }
									</span>
								) }
							</button>
						</li>
					);
				} ) }
			</ul>
		</>
	);
}
