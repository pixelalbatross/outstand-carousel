# Migrating from Slider Block

Outstand Carousel replaces [Slider Block](https://github.com/pixelalbatross/slider-block) (`pixelalbatross/slider`), which no longer receives updates. The two plugins use different block names, so they can run side by side while you migrate.

## Before you start

1. Back up the site: files and database.
2. Check the requirements: WordPress 7.1 or higher and PHP 8.2 or higher.
3. Install and activate Outstand Carousel. **Keep Slider Block active until the migration is complete.** Without it, the old sliders show as unsupported blocks and can't be converted.

## Option 1: in the editor

No terminal needed. Repeat for every slider:

1. Open the content that holds the slider.
2. Select the old **Slider** block. The list view (the icon with three lines at the top left) helps with nested blocks.
3. In the block toolbar, open the block type menu and choose **Transform to** > **Carousel**.
4. Save.

The slides and their content move across unchanged, and the slider settings are converted. When a setting has no equivalent, a notice lists it.

Sliders can live in any of these places. Check each one:

- posts and pages;
- custom post types, such as products or portfolio items;
- templates and template parts, under Appearance > Editor;
- synced patterns, under Appearance > Editor > Patterns;
- widget areas, on classic themes.

Templates and patterns shipped inside a theme's files can't be edited here. Ask the theme developer to update them.

If you prefer to rebuild a slider instead, add a new **Carousel** block, move the content into its slides, and delete the old block.

## Option 2: WP-CLI

For sites with many sliders. The command converts every slider stored in the database, including templates, template parts and synced patterns. Each change is saved as a new revision.

```bash
# List what would change.
wp outstand-carousel migrate --dry-run

# Convert everything.
wp outstand-carousel migrate

# Limit the migration to some post types or posts.
wp outstand-carousel migrate --post_type=page,wp_template
wp outstand-carousel migrate --include=12,34
```

The output lists each converted post and the settings that had no equivalent.

## What changes

| Slider Block | Outstand Carousel |
| --- | --- |
| `pixelalbatross/slider` | `outstand/carousel` |
| `pixelalbatross/slide` | `outstand/slide`, inside a new `outstand/slides` block |
| Loop | Type: Loop |
| Rewind, Speed, Height, Auto Height, Aria Label | Same settings (Height becomes Slide height) |
| Per View | Slides per page |
| Space Between Slides | Gap between slides |
| Centered Slides | Center the active slide |
| Free Mode | Free drag |
| Autoplay, Delay, Pause on Hover | Autoplay, Interval, Pause on hover |
| Navigation | Carousel Navigation block |
| Pagination type: Bullets | Carousel Pagination block, as dots |
| Pagination type: Fraction | Carousel Counter block |

The converter keeps the old speed (300ms) and autoplay delay (3000ms) when a slider used the defaults, and it keeps the slider's alignment, colors and spacing.

### Settings without an equivalent

- **Hash Navigation** and each slide's **URL Hash** are dropped.
- **Width** is dropped. Use the block alignment or a parent group's width.
- **Progress Bar** pagination becomes dots.

### Code

- The markup changes. Swiper classes (`swiper`, `swiper-slide`, `swiper-button-next`, `swiper-pagination` and others) and the `wp-block-pixelalbatross-slider*` and `wp-block-pixelalbatross-slide*` classes are gone. Update any custom CSS to target the new blocks, such as `.wp-block-outstand-carousel`, `.wp-block-outstand-slide` and `.wp-block-outstand-carousel-navigation__button`.
- The PHP filter `pixelalbatross_slider_block_slider_options` is replaced by `outstand_carousel_options`, which receives [Splide options](https://splidejs.com/guides/options/).
- The JavaScript filter `pixelalbatross.sliderBlock.allowedBlocks` is removed. A slide accepts any block; to restrict it, use the `allowed_block_types_all` filter or the block's `allowedBlocks` metadata.
- The `js` class Slider Block added to `<html>` is removed.

## Finish

When no old sliders are left, deactivate and delete Slider Block. To confirm nothing is left in the database, run `wp outstand-carousel migrate --dry-run`: it reports "No Slider Block sliders found."
