/**
 * Carousel Counter block editor.
 */
import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	ToggleControl,
	__experimentalVStack as VStack, // eslint-disable-line @wordpress/no-unsafe-wp-apis
} from '@wordpress/components';

import { formatCounter } from '../../shared/counter';
import { useCarousel } from '../../hooks/use-carousel';

export default function CarouselCounterEdit( {
	attributes,
	setAttributes,
	clientId,
} ) {
	const { separator, padNumbers } = attributes;
	const { activeIndex, total } = useCarousel( clientId );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Settings', 'outstand-carousel' ) }>
					<VStack spacing={ 4 }>
						<TextControl
							label={ __( 'Separator', 'outstand-carousel' ) }
							value={ separator }
							onChange={ ( value ) =>
								setAttributes( { separator: value } )
							}
						/>
						<ToggleControl
							label={ __(
								'Pad numbers with zeros',
								'outstand-carousel'
							) }
							help={ __(
								'Shows 01 / 05 instead of 1 / 5.',
								'outstand-carousel'
							) }
							checked={ padNumbers }
							onChange={ ( value ) =>
								setAttributes( { padNumbers: value } )
							}
						/>
					</VStack>
				</PanelBody>
			</InspectorControls>
			<div { ...useBlockProps() }>
				{ formatCounter(
					activeIndex + 1,
					Math.max( total, 1 ),
					separator,
					padNumbers
				) }
			</div>
		</>
	);
}
