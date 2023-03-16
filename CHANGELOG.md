# Changelog

## [1.9.1] - 2023-03-16

- Pointing to new home at TypeScript OSS.

## [1.9.0] - 2023-02-23

- Exposed two, previously internal-only, utility hooks: `useCallbackRef` and `useStableValue`, which are generally useful in React development.

## [1.8.1] - 2023-02-22

- Added `getAreEqual`, which returns the current `areEqual` function (different than calling `areEqual`, which actually performs a comparison).

## [1.8.0] - 2023-02-17

- Added `useBiDirBindingSync` and `useUniDirBindingSync` utility hooks for convenient synchronization of bindings.

## [1.7.1] - 2023-02-02

- Using client-run-queue 2.0.1.

## [1.7.0] - 2023-02-02

- Using client-run-queue 2.0.0.

## [1.6.6] - 2023-01-23

- Now including src folder into npm package so source maps can resolve properly.

## [1.6.5] - 2023-01-11

- Removed tuple type due to type extraction changes in TypeScript 4.9.

## [1.6.4] - 2023-01-10

- Updated codebase to TypeScript 4.9.

## [1.6.3] - 2022-08-23

- Simplified internal code for binding callbacks.

## [1.6.2] - 2022-08-12

- `BindingDependencies` now extends `undefined`.
- Removed unnecessary default generics for `DependenciesT`.

## [1.6.1] - 2022-08-12

- Fixed inconsistency where passing `undefined` bindings to hooks like `useDerivedBinding` would pass `{}` as the value.

## [1.6.0] - 2022-08-12

### Fixed

- An issue where `useBindingEffect` ignored the limiter options for `deps` and mount-based changes.

### Changed

- `useBindingEffect` no longer waits for mount before running callbacks.

## [1.5.0] - 2022-08-12

- `DefaultQueueProvider` now has `cancelAllOnUnmount` prop, which defaults to `false`.

### Notes

- `cancelAllOnUnmount` defaults to `false` on `DefaultQueueProvider`, which potentially changes the behavior in subtle ways.   The previous behavior was effectively `cancelAllOnUnmount=true`.

## [1.4.5] - 2022-08-02

- Updated docs.

## [1.4.4] - 2022-08-01

- Updated package dependencies.

## [1.4.3] - 2022-07-21

- Fixed a bug where `useBindingEffect` wasn't being re-triggered properly when `deps` changed.

## [1.4.2] - 2022-07-21

- Updated package dependencies.

## [1.4.1] - 2022-07-21

- Fixed a bug with switching binding listeners.

## [1.3.4] - 2022-07-17

- If the same binding is included more than once as a dependency (to `BindingsConsumer`, `useBindingEffect`, etc.), only one listener will added now.

## [1.3.3] - 2022-07-13

- Renamed `ExtractBindingsArrayValues` to `InferBindingsArrayValueTypes`.
- Renamed `ExtractNamedBindingsValues` to `InferNamedBindingsValueTypes`.
- Exported `InferBindingValueTypes`.

## [1.3.2] - 2022-07-13

- Renamed `BindingsArrayDependencies` to `BindingArrayDependencies` for better consistency.
- Renamed `ExtractBindingValueTypes` to `InferBindingValueTypes` for better consistency.

## [1.3.1] - 2022-07-13

- Fixed typing bug where `undefined` wasn't properly supported.

## [1.3.0] - 2022-07-13

### Changed

- The generics typing on `BindingsConsumer`, `useBindingEffect`, `useFlattenedBinding`, and `useDerivedBinding` to allow for value extraction from single bindings, arrays, and tuples, in addition to from objects, which were previously supported.
- The callbacks for the above now receive extracted values inline with their original structures -- not just when objects are used, as previously.
- The callbacks for the above also now receive all input bindings as passed -- not just when objects are used, as previously.

### Notes

This breaks compile-time backwards compatibility but only for projects that are directly using the interfaces for `BindingsConsumer`, `useBindingEffect`, `useFlattenedBinding`, or `useDerivedBinding`.  The runtime compatibility is the same, hence only the minor version bump.

## [1.2.2] - 2022-07-01 … [1.2.4] - 2022-07-05

- Updated docs.

## [1.2.1] - 2022-06-30

- Switched dev build to use React 18.  It still supports React >= 16.9.0 though.

## [1.2.0] - 2022-06-30

- Fixed an issue with `BindingsConsumer` when leading edge limiting was applied, where the limiter state was getting reset -- so rendering was more frequent than desired.  Calling `cancel` on a limiter no longer resets the limiter state.

## [1.1.0] - 2022-06-29

### Changed

- All callbacks that received extracted named bindings values now also receive the original named bindings objects (or an empty object where named bindings aren't specified)
- Exported the `ExtractNamedBindingsValues` type and the types for callbacks that take extracted named binding values.
- Various other internal code quality improvements, for better internal consistency.

## [1.0.3] - 2022-06-27

- Optimized `useBindingEffect` by eliminating unnecessary calls to `makeChangeUidsString` on re-render.

## [1.0.2] - 2022-06-27

- Removed unused option for `SpecialLoggingType`.
- Updated docs.

## [1.0.1] - 2022-06-24

- Updated package.json with metadata.

## [1.0.0] - 2022-06-13

- Initial official public release.
