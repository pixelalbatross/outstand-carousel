/**
 * Formats the counter text, such as "1 / 5" or "01 / 05".
 *
 * Mirrors `Interactivity::format_counter()`.
 *
 * @param {number}  current   Current slide number, from 1.
 * @param {number}  total     Number of slides.
 * @param {string}  separator Text between the two numbers.
 * @param {boolean} pad       Whether to pad both numbers with zeros to at least two digits.
 * @return {string} Counter text.
 */
export function formatCounter( current, total, separator, pad ) {
	if ( ! pad ) {
		return `${ current }${ separator }${ total }`;
	}

	const digits = Math.max( 2, String( total ).length );

	return `${ String( current ).padStart( digits, '0' ) }${ separator }${ String( total ).padStart( digits, '0' ) }`;
}

/**
 * Formats the progress bar width, such as "40%" on the second of five slides.
 *
 * Mirrors `Interactivity::format_progress()`.
 *
 * @param {number} activeIndex Index of the active slide, from 0.
 * @param {number} total       Number of slides.
 * @return {string} CSS percentage.
 */
export function formatProgress( activeIndex, total ) {
	return `${ Math.round( ( ( activeIndex + 1 ) / Math.max( 1, total ) ) * 1000000 ) / 10000 }%`;
}
