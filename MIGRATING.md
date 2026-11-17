# Migrating from Slider Block

Outstand Carousel replaces [Slider Block](https://github.com/pixelalbatross/slider-block) (`pixelalbatross/slider`), which no longer receives updates. The two plugins use different block names, so they can run side by side while you migrate.

## Before you start

1. Back up the site: files and database.
2. Check the requirements: WordPress 7.1 or higher and PHP 8.2 or higher.
3. Install and activate Outstand Carousel.
4. To convert sliders in the editor, keep Slider Block active until you finish. Without it, the editor shows the old sliders as unsupported blocks and can't convert them. The WP-CLI command works without it.

While Slider Block is inactive, Outstand Carousel shows the old sliders on the front end as its own carousels. The stored content does not change until you convert it.

## Option 1: in the editor

No terminal needed. Repeat for every slider:

1. Open the content that holds the slider.
2. Select the old **Slider** block. The list view (the icon with three lines at the top left) helps with nested blocks.
3. In the block toolbar, open the block type menu and choose **Transform to** > **Carousel**.
4. Save.

The slides and their content move across, and the slider settings are converted. Sliders inside the slides are converted too. When a setting has no equivalent, a notice lists it.

Sliders can live in any of these places. Check each one:

- posts and pages;
- custom post types;
- templates and template parts, under Appearance > Editor;
- synced patterns, under Appearance > Editor > Patterns;
- widget areas, on classic themes.

Templates and patterns shipped inside a theme's files can't be edited here. Ask the theme developer to update them.

## Option 2: WP-CLI

For sites with many sliders. Slider Block does not need to be active. The command checks:

- posts of every post type and status, including templates, template parts and synced patterns;
- block widgets.

It does not check revisions or templates stored in theme files.

```bash
# List what would change.
wp outstand-carousel migrate --dry-run

# Convert everything.
wp outstand-carousel migrate

# Limit the migration to some post types or posts.
wp outstand-carousel migrate --post_type=page,wp_template
wp outstand-carousel migrate --include=12,34
```

- `--post_type` and `--include` limit the posts only. Block widgets are always checked.
- The table lists each post and widget with sliders, and the settings that had no equivalent.
- WordPress saves a revision of each changed post when its post type supports revisions and revisions are enabled.
- A scheduled post whose date has passed is skipped, because saving it would publish it. Publish it or change its date, then run the command again.
- If a save fails, the table shows the error and the command exits with an error.
- Restoring a revision from before the migration brings back the old slider. While Slider Block is inactive, the front end still shows it as a carousel. Run the command again to convert it.

On multisite, Outstand Carousel must be active on each site. Run the command once for each site:

```bash
wp site list --field=url | xargs -I % wp outstand-carousel migrate --url=%
```

## What changes

| Slider Block | Outstand Carousel |
| --- | --- |
| `pixelalbatross/slider` | `outstand/carousel` |
| `pixelalbatross/slide` | `outstand/slide`, inside a new `outstand/slides` block |
| Loop | Type: Loop |
| Rewind | Rewind |
| Speed | Transition speed |
| Auto Height | Fit the height to each slide |
| Aria Label | The carousel's `aria-label`, which has no control in the editor |
| Per View | Slides per page |
| Space Between Slides | Gap between slides |
| Centered Slides | Center the active slide |
| Free Mode | Free drag |
| Autoplay, Delay, Pause on Hover | Autoplay, Interval, Pause on hover |
| Navigation | Carousel Navigation block |
| Pagination type: Bullets | Carousel Pagination block, as dots |
| Pagination type: Fraction | Carousel Counter block |
| Pagination type: Progress Bar | Carousel Pagination block, as a progress bar |
| Hash Navigation, and each slide's URL Hash | Hash navigation, and each slide's URL hash |

The slider's alignment, colors, spacing and additional CSS classes stay, and so do each slide's colors and classes. The converter keeps Swiper's speed (300ms) and autoplay delay (3000ms) when a slider used the defaults.

The gap is the number of pixels Swiper used. Swiper read the number at the start of the value and ignored any unit, so a gap of `2rem` becomes `2px`.

The slide ratio stays on Auto and the maximum slide height stays empty, so images in slides keep their ratio, as in Slider Block.

Blocks placed inside a slider but outside a slide are removed. The Slider Block editor allowed only slides there.

The navigation, pagination and counter blocks sit below the slides. Swiper laid its buttons and pagination over the slides. The Slides block can sit inside a group with the other blocks, for example to lay the navigation over the slides.

The left and right arrow keys move the slides while focus is inside the carousel. Swiper also moved a slider that was in view when focus was elsewhere on the page.

### Settings without an equivalent

- **Width** is dropped. Use the block alignment or a parent group's width.
- **Height** is dropped. Swiper sized a horizontal slider by its width only, so the height had no visible effect. To size the slides, use Slide ratio, Slide height or Maximum slide height.
- A pagination type other than Bullets, Fraction or Progress Bar becomes dots.

### Code

- The markup changes. Swiper classes (`swiper`, `swiper-slide`, `swiper-button-next`, `swiper-pagination` and others) and the `wp-block-pixelalbatross-slider*` and `wp-block-pixelalbatross-slide*` classes are gone. Update custom CSS to target the new blocks, such as `.wp-block-outstand-carousel`, `.wp-block-outstand-slide` and `.wp-block-outstand-carousel-navigation__button`.
- A slide prints its `data-hash` attribute only when the carousel has hash navigation on.
- The PHP filter `pixelalbatross_slider_block_slider_options` is replaced by `outstand_carousel_options`, which receives [Splide options](https://splidejs.com/guides/options/).
- The JavaScript filter `pixelalbatross.sliderBlock.allowedBlocks` is removed. A slide accepts any block. To restrict it, use the `allowed_block_types_all` filter or the block's `allowedBlocks` metadata.
- The JavaScript filters `pixelalbatross.sliderBlock.enableAutoHeight`, `pixelalbatross.sliderBlock.minSpeed`, `pixelalbatross.sliderBlock.maxSpeed`, `pixelalbatross.sliderBlock.minPerView` and `pixelalbatross.sliderBlock.maxPerView` are removed. The carousel settings always show Fit the height to each slide.
- The `js` class Slider Block added to `<html>` is removed.

## Finish

When no old sliders are left, deactivate and delete Slider Block. To confirm that no posts or block widgets hold old sliders, run `wp outstand-carousel migrate --dry-run`: it reports "No Slider Block sliders found."
