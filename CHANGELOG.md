# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0]

### Added

- This CHANGELOG
- Query proxy for `whereIn()` method
- Support for events
- Methods for fetching related data of a single item (e.g. `User.messages(1)`)

### Changed

- `table()` in QueryBuilder will throw an exception
- model scopes are no longer proxies to the query builder **(breaking change)**

### Removed

- `queryProxy` option of `Model.extend()` **(breaking change)**

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

[unreleased]: https://github.com/baethon/kex/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/baethon/kex/compare/v1.0.0-rc.1...v1.0.0
[1.0.0-rc.1]: https://github.com/baethon/kex/compare/v1.0.0-rc.0...v1.0.0-rc.1
[1.0.0-rc.0]: https://github.com/baethon/kex/releases/tag/v1.0.0-rc.0
