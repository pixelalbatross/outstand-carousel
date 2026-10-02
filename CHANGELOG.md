# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.5.0] - 2026-10-02

### Added

- Backdrop setting on slides, in the Background panel: a copy of the slide image fills the space around an image that doesn't fill its slide. "Blurred image" enlarges, blurs and slightly lightens it.

## [1.4.0] - 2026-10-02

### Added

- Background colour on the Slides block, which paints only the slides area.
- A background colour on a slide, the Slides block or the carousel shows around images that don't fill their slide, over the placeholder colour image plugins such as Performance Lab paint on the image. A slide's colour wins over the Slides block's.

## [1.3.0] - 2026-10-02

### Added

- Slide ratio, maximum slide height and image fit settings. With the ratio on Auto, slides take their content's height, so images keep their ratio; a maximum height such as `80vh` keeps tall slides within the screen, and images in a sized slide cover or contain it.

### Fixed

- Block settings use core's spacing between controls; it was doubled.

### Removed

- The Slider Block (`pixelalbatross/slider`) editor transform and the `wp outstand-carousel migrate` command.

## [1.2.2] - 2026-10-01

### Changed

- Image slides are created with the cover scale, so the image's focal point (Styles › Dimensions) sets what stays in view; pick each slide's image size under Resolution in the image's Settings.

## [1.2.1] - 2026-10-01

### Fixed

- Images picked in an empty carousel's placeholder are added as slides.
- Picking one image no longer adds it twice.

## [1.2.0] - 2026-09-30

### Added

- Hash navigation: a slide's URL hash opens the carousel on it, and the URL follows the active slide.
- Progress bar pagination style.
- The Slider Block migration keeps hash navigation, slide hashes and progress bar pagination.

## [1.1.0] - 2026-09-30

### Added

- Icon picker for the navigation block: a searchable grid of every registered icon.
- An `is-icon-collection-<collection>` class on every navigation icon, so themes can style their own icons.

### Changed

- The editor draws the navigation icons as the same `<svg>` the front end outputs, and reads icons from the core icon store.

## [1.0.0] - 2026-09-30

### Added

- Carousel block, powered by Splide and the Interactivity API, with slides, navigation, pagination (dots or thumbnails) and counter blocks.
- Editor transform and `wp outstand-carousel migrate` command to convert Slider Block (`pixelalbatross/slider`) sliders. See [MIGRATING.md](MIGRATING.md).

[Unreleased]: https://github.com/pixelalbatross/outstand-carousel/compare/1.5.0...HEAD
[1.5.0]: https://github.com/pixelalbatross/outstand-carousel/compare/1.4.0...1.5.0
[1.4.0]: https://github.com/pixelalbatross/outstand-carousel/compare/1.3.0...1.4.0
[1.3.0]: https://github.com/pixelalbatross/outstand-carousel/compare/1.2.2...1.3.0
[1.2.2]: https://github.com/pixelalbatross/outstand-carousel/compare/1.2.1...1.2.2
[1.2.1]: https://github.com/pixelalbatross/outstand-carousel/compare/1.2.0...1.2.1
[1.2.0]: https://github.com/pixelalbatross/outstand-carousel/compare/1.1.0...1.2.0
[1.1.0]: https://github.com/pixelalbatross/outstand-carousel/compare/1.0.0...1.1.0
[1.0.0]: https://github.com/pixelalbatross/outstand-carousel/releases/tag/1.0.0
