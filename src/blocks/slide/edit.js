/**
 * Slide block editor.
 */
import clsx from 'clsx';
import { __ } from '@wordpress/i18n';
import { createBlock } from '@wordpress/blocks';
import {
	BlockControls,
	InspectorControls,
	store as blockEditorStore,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	ToolbarButton,
	ToolbarGroup,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { plus } from '@wordpress/icons';

import { useCarousel } from '../../hooks/use-carousel';

// Spaces and `#` aren't valid in a URL hash.
const INVALID_HASH_CHARACTERS = /[\s#]/g;

const TEMPLATE = [ [ 'core/heading', { level: 2 } ], [ 'core/paragraph' ] ];

export default function SlideEdit( {
	attributes,
	setAttributes,
	clientId,
	isSelected,
	context,
} ) {
	const { activeIndex, perPage, goTo } = useCarousel( clientId );
	const { index, parentId, hasChildSelected } = useSelect(
		( select ) => {
			const {
				getBlockIndex,
				getBlockRootClientId,
				hasSelectedInnerBlock,
			} = select( blockEditorStore );

			return {
				index: getBlockIndex( clientId ),
				parentId: getBlockRootClientId( clientId ),
				hasChildSelected: hasSelectedInnerBlock( clientId, true ),
			};
		},
		[ clientId ]
	);
	const { insertBlock } = useDispatch( blockEditorStore );

	const isVisible = index >= activeIndex && index < activeIndex + perPage;

	// Selecting a hidden slide, from the list view for example, shows it.
	useEffect( () => {
		if ( ( isSelected || hasChildSelected ) && ! isVisible ) {
			goTo( index );
		}
	}, [ isSelected, hasChildSelected, isVisible, index, goTo ] );

	const blockProps = useBlockProps( {
		className: clsx( 'splide__slide', {
			'is-active': index === activeIndex,
			'is-visible': isVisible,
		} ),
	} );
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: TEMPLATE,
	} );

	return (
		<>
			{ !! context[ 'outstand/carousel/hashNavigation' ] && (
				<InspectorControls>
					<PanelBody title={ __( 'Settings', 'outstand-carousel' ) }>
						<TextControl
							label={ __( 'URL hash', 'outstand-carousel' ) }
							help={ __(
								'Opens the carousel on this slide when the page URL ends with this hash.',
								'outstand-carousel'
							) }
							value={ attributes.hash }
							onChange={ ( value ) =>
								setAttributes( {
									hash: value.replace(
										INVALID_HASH_CHARACTERS,
										'-'
									),
								} )
							}
						/>
					</PanelBody>
				</InspectorControls>
			) }
			<BlockControls group="other">
				<ToolbarGroup>
					<ToolbarButton
						icon={ plus }
						label={ __( 'Add slide after', 'outstand-carousel' ) }
						onClick={ () =>
							insertBlock(
								createBlock( 'outstand/slide' ),
								index + 1,
								parentId
							)
						}
					/>
				</ToolbarGroup>
			</BlockControls>
			<li { ...innerBlocksProps } />
		</>
	);
}
