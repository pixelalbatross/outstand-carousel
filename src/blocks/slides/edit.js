/**
 * Slides block editor.
 */
import { __ } from '@wordpress/i18n';
import { createBlock } from '@wordpress/blocks';
import {
	BlockControls,
	MediaPlaceholder,
	MediaUpload,
	MediaUploadCheck,
	store as blockEditorStore,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { Button, ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { useDispatch, useRegistry } from '@wordpress/data';
import { image as imageIcon, plus } from '@wordpress/icons';

import { useCarousel } from '../../hooks/use-carousel';

/**
 * Creates one slide per image. Each image covers its slide, so the image's
 * focal point decides what stays in view.
 *
 * @param {Object[]} media Selected attachments.
 * @return {Object[]} Slide blocks.
 */
function createImageSlides( media ) {
	return media.map( ( item ) =>
		createBlock( 'outstand/slide', {}, [
			createBlock( 'core/image', {
				id: item.id,
				url: item.url,
				alt: item.alt,
				sizeSlug: 'large',
				scale: 'cover',
			} ),
		] )
	);
}

export default function SlidesEdit( { clientId } ) {
	const { total, activeIndex } = useCarousel( clientId );
	const { insertBlock, insertBlocks } = useDispatch( blockEditorStore );
	const registry = useRegistry();

	const blockProps = useBlockProps( { className: 'splide__track' } );
	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'splide__list' },
		{ renderAppender: false, orientation: 'horizontal' }
	);

	const addSlide = () =>
		insertBlock(
			createBlock( 'outstand/slide' ),
			total ? activeIndex + 1 : 0,
			clientId
		);
	// The media library's gallery frame can report one selection twice, so
	// images that are already slides are skipped.
	const addImages = ( media ) => {
		const slides = registry
			.select( blockEditorStore )
			.getBlocks( clientId );
		const slideImageIds = slides.flatMap( ( slide ) =>
			slide.innerBlocks.map( ( block ) => block.attributes.id )
		);
		const newMedia = media.filter(
			( item ) => ! slideImageIds.includes( item.id )
		);

		if ( newMedia.length ) {
			insertBlocks(
				createImageSlides( newMedia ),
				slides.length,
				clientId
			);
		}
	};

	// The inner block list stays mounted while empty, so the editor knows its
	// settings and accepts the slides the placeholder inserts.
	if ( ! total ) {
		return (
			<div { ...blockProps }>
				<MediaPlaceholder
					icon="images-alt2"
					labels={ {
						title: __( 'Slides', 'outstand-carousel' ),
						instructions: __(
							'Upload or pick images to create one slide per image, or start with an empty slide.',
							'outstand-carousel'
						),
					} }
					allowedTypes={ [ 'image' ] }
					multiple
					onSelect={ addImages }
				>
					<Button
						__next40pxDefaultSize
						variant="secondary"
						onClick={ addSlide }
					>
						{ __(
							'Start with an empty slide',
							'outstand-carousel'
						) }
					</Button>
				</MediaPlaceholder>
				<ul { ...innerBlocksProps } />
			</div>
		);
	}

	return (
		<>
			<BlockControls group="other">
				<ToolbarGroup>
					<ToolbarButton
						icon={ plus }
						label={ __( 'Add slide', 'outstand-carousel' ) }
						onClick={ addSlide }
					/>
					<MediaUploadCheck>
						<MediaUpload
							allowedTypes={ [ 'image' ] }
							multiple
							onSelect={ addImages }
							render={ ( { open } ) => (
								<ToolbarButton
									icon={ imageIcon }
									label={ __(
										'Add image slides',
										'outstand-carousel'
									) }
									onClick={ open }
								/>
							) }
						/>
					</MediaUploadCheck>
				</ToolbarGroup>
			</BlockControls>
			<div { ...blockProps }>
				<ul { ...innerBlocksProps } />
			</div>
		</>
	);
}
