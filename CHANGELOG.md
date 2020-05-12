# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- This CHANGELOG

## [1.0.0-rc.1] - 2020-05-11

### Changed

- `find()` and `findOrFail()` will ignore all global scopes
- bind model query builder to WHERE callbacks only when they're wrapped using `whereWrapped()` QueryBuilder helper

## [1.0.0-rc.0] - 2020-05-09

### Added

- Models with custom query builder classes
- Support for scopes
- Support for relations
- Support for soft-deletes
- Support for timestamps

[unreleased]: https://github.com/baethon/kex/compare/v1.0.0-rc.1...HEAD
[1.0.0-rc.1]: https://github.com/baethon/kex/compare/v1.0.0-rc.0...v1.0.0-rc.1
[1.0.0-rc.0]: https://github.com/baethon/kex/releases/tag/v1.0.0-rc.0
