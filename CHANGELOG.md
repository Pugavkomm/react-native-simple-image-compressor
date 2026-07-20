
# [0.2.0-alpha.2](https://github.com/Pugavkomm/react-native-simple-image-compressor/compare/v0.2.0-alpha.1...v0.2.0-alpha.2) (2026-07-18)


### Features

* add `height` and `width` properties to `CompressedResult` ([#11](https://github.com/Pugavkomm/react-native-simple-image-compressor/issues/11)) ([b7ef7bb](https://github.com/Pugavkomm/react-native-simple-image-compressor/commit/b7ef7bb5a66dffe74a82d4109d73a9f71c72d1cf))
* **android:** replace file system handling with `contentResolver` ([#13](https://github.com/Pugavkomm/react-native-simple-image-compressor/issues/13)) ([cc95d7c](https://github.com/Pugavkomm/react-native-simple-image-compressor/commit/cc95d7ca594c450e15d27f847c69cc768ef56381))

# [0.2.0-alpha.1](https://github.com/Pugavkomm/react-native-simple-image-compressor/compare/v0.2.0-alpha.0...v0.2.0-alpha.1) (2026-07-16)


### Features

* add `enablePhysicalRotation` option to preserve EXIF orientation ([#9](https://github.com/Pugavkomm/react-native-simple-image-compressor/issues/9)) ([53b5244](https://github.com/Pugavkomm/react-native-simple-image-compressor/commit/53b524412d3d0debea57f69486aa151cb472686a))

# [0.2.0-alpha.0](https://github.com/Pugavkomm/react-native-simple-image-compressor/compare/48f32c1e9d33003cf1c1217eabfcf15ddd314d0c...v0.2.0-alpha.0) (2026-07-12)


### Bug Fixes

* **android:** oom issue inside `decodeSampleBitmap` ([49895a0](https://github.com/Pugavkomm/react-native-simple-image-compressor/commit/49895a0bbcadf8275bca83d4bc1090782ba7d74b))
* **ios:** fix rotation ([#7](https://github.com/Pugavkomm/react-native-simple-image-compressor/issues/7)) ([aaf4d78](https://github.com/Pugavkomm/react-native-simple-image-compressor/commit/aaf4d78d87edf3d92b4962d1f349e03a3a8ad53d))


### Features

* **android:** preserve EXIF metadata and fix rotation ([#6](https://github.com/Pugavkomm/react-native-simple-image-compressor/issues/6)) ([61ec1a3](https://github.com/Pugavkomm/react-native-simple-image-compressor/commit/61ec1a3024bce340f23814c8095b064392197c10))
* change `compressImage` return type to `CompressedResult` ([c8a3568](https://github.com/Pugavkomm/react-native-simple-image-compressor/commit/c8a35684503084efc67366bdb134513c3e7d4c4d))
* **ios:** add webp encoder ([#4](https://github.com/Pugavkomm/react-native-simple-image-compressor/issues/4)) ([8090f0a](https://github.com/Pugavkomm/react-native-simple-image-compressor/commit/8090f0a3749eaf606d581d53b659612e3c2410ab))
* **ios:** implement native image compression service ([48f32c1](https://github.com/Pugavkomm/react-native-simple-image-compressor/commit/48f32c1e9d33003cf1c1217eabfcf15ddd314d0c))
* **ios:** preserve EXIF metadata ([#8](https://github.com/Pugavkomm/react-native-simple-image-compressor/issues/8)) ([db9bb56](https://github.com/Pugavkomm/react-native-simple-image-compressor/commit/db9bb56d45090197099f20652d004fd619954dd2))
