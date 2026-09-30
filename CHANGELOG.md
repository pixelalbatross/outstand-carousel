# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/s3rgiosan/outstand-carousel/compare/1.1.0...HEAD
[1.1.0]: https://github.com/s3rgiosan/outstand-carousel/compare/1.0.0...1.1.0
[1.0.0]: https://github.com/s3rgiosan/outstand-carousel/releases/tag/1.0.0
