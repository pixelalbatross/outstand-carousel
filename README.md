# Outstand Carousel

> Carousel block with composable navigation, pagination and counter, powered by Splide and the Interactivity API.

## Features

The **Carousel** block holds these blocks, which you can arrange, style and nest in groups:

- **Slides**: the slides themselves. It can sit inside a group, for example to overlay the navigation on the slides. Each **Slide** can hold any blocks. Pick images from the media library to create one slide per image.
- **Carousel Navigation**: previous and next buttons, with icons from the WordPress icon registry. When the carousel autoplays, it adds a play/pause button. Hidden when there is only one slide.
- **Carousel Pagination**: one button per slide, shown as dots or as thumbnails of each slide's first image, or a progress bar.
- **Carousel Counter**: the current slide and the total, such as `1 / 5` or `01 / 05`. Hidden when there is only one slide.

Carousel settings:

- type: slide, loop or fade;
- slides per page, with a separate value for mobile;
- gap, slide height and transition speed;
- slide ratio (auto, so images keep their ratio, or a fixed ratio such as 16:9), maximum slide height, and how images fill a sized slide (cover or contain);
- rewind, center the active slide, free drag and fit the height to each slide;
- autoplay, with interval and pause on hover;
- hash navigation: each slide can have a URL hash, such as `#team`, that opens the carousel on it, and the URL follows the active slide.

The left and right arrow keys move the slides while focus is inside the carousel.

The server renders the first slide, the counter and the button states, so the page is complete before JavaScript loads. Without JavaScript, the slides scroll natively.

## Requirements

- WordPress 7.1 or higher
- PHP 8.2 or higher

## Installation

### Manual installation

1. Download the latest release ZIP from the [Releases page](https://github.com/pixelalbatross/outstand-carousel/releases/latest).
2. Go to Plugins > Add New > Upload Plugin in your WordPress admin area.
3. Upload the ZIP file and click Install Now.
4. Activate the plugin.

### Install with Composer

```bash
composer require outstand/carousel
```

Then activate the plugin from your WordPress admin area or with WP-CLI.

## Customization

### Splide options

The `outstand_carousel_options` filter receives the [Splide options](https://splidejs.com/guides/options/) of each carousel, its block attributes and the block instance:

```php
add_filter(
	'outstand_carousel_options',
	function ( array $options, array $attributes ) {
		if ( 'loop' === $attributes['type'] ) {
			$options['drag'] = 'free';
		}

		return $options;
	},
	10,
	2
);
```

The navigation, pagination and counter blocks replace Splide's own arrows and pagination, so `arrows` and `pagination` stay `false`.

### Icons

The navigation block uses `core/arrow-left` and `core/arrow-right` by default. Any icon registered with `wp_register_icon()` can replace them: the block settings show every registered icon in a searchable picker.

The icon registry keeps only fills, so outline icons need their stroke from CSS. Every navigation icon, in the editor, the icon picker and the front end, carries an `is-icon-collection-<collection>` class, so a theme can style its own icons:

```css
svg.is-icon-collection-my-theme {
	fill: none;
	stroke: currentcolor;
	stroke-width: 2;
}
```

The editor sidebar is outside the canvas, so load the rule there too, for example from a stylesheet enqueued on `enqueue_block_editor_assets`. Core buttons set `fill` on their icons, so the sidebar needs `.components-button svg.is-icon-collection-my-theme`.

### CSS custom properties

| Property | Default | Used by |
| --- | --- | --- |
| `--outstand-carousel-dot-size` | `0.625rem` | Pagination dots |
| `--outstand-carousel-thumbnail-width` | `4.5rem` | Pagination thumbnails |
| `--outstand-carousel-thumbnail-aspect-ratio` | `1` | Pagination thumbnails |
| `--outstand-carousel-progress-height` | `0.25rem` | Pagination progress bar |

## Development

```bash
composer install
npm install
npm run build
```

- `composer lint` runs PHPCS.
- `npm run lint:js` and `npm run lint:css` run ESLint and Stylelint.
- `npm run test:js` runs the JavaScript unit tests.

## Changelog

All notable changes to this project are documented in [CHANGELOG.md](https://github.com/pixelalbatross/outstand-carousel/blob/main/CHANGELOG.md).

## License

This project is licensed under the [GPL-3.0-or-later](https://spdx.org/licenses/GPL-3.0-or-later.html).
