/**
 * An icon from the WordPress icon registry, rendered as the `<svg>` that
 * `wp_get_icon()` outputs on the front end.
 */
import clsx from 'clsx';
import { safeHTML } from '@wordpress/dom';
import { useMemo } from '@wordpress/element';

/**
 * Renders a registered icon.
 *
 * Mirrors `Icons::render()`: the `<svg>` gets an `is-icon-collection-<collection>`
 * class, so a theme can style its own icons.
 *
 * @param {Object} props             Component props.
 * @param {Object} props.icon        Icon record from the `root/icon` entity.
 * @param {number} [props.size]      Width and height in pixels.
 * @param {string} [props.className] Classes for the `<svg>` element.
 * @return {Element|null} Icon, or nothing when the markup has no `<svg>`.
 */
export default function RegistryIcon( { icon, size, className } ) {
	const content = icon?.content ?? '';

	const parsed = useMemo( () => {
		if ( ! content ) {
			return null;
		}

		const doc = new window.DOMParser().parseFromString(
			safeHTML( content ),
			'text/html'
		);
		const svg = doc.body.querySelector( 'svg' );

		if ( ! svg ) {
			return null;
		}

		return {
			viewBox: svg.getAttribute( 'viewBox' ) ?? '0 0 24 24',
			body: svg.innerHTML,
		};
	}, [ content ] );

	if ( ! parsed ) {
		return null;
	}

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox={ parsed.viewBox }
			width={ size }
			height={ size }
			className={ clsx(
				className,
				`is-icon-collection-${ icon.collection }`
			) }
			aria-hidden="true"
			focusable="false"
			dangerouslySetInnerHTML={ { __html: parsed.body } }
		/>
	);
}
