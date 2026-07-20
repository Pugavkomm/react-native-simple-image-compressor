# Changelog

# [0.2.0-beta.0](https://github.com/Pugavkomm/react-native-simple-image-compressor/compare/v0.2.0-alpha.4...v0.2.0-beta.0) (2026-07-20)


### Bug Fixes

* **android:** add recycle after compressing to prevent memory leak ([#21](https://github.com/Pugavkomm/react-native-simple-image-compressor/issues/21)) ([5e7cc83](https://github.com/Pugavkomm/react-native-simple-image-compressor/commit/5e7cc83c466d14cb3adac2354181787d66f67433))


### Features

* add structured error handling for native exceptions ([#32](https://github.com/Pugavkomm/react-native-simple-image-compressor/issues/32)) ([ac1fdc1](https://github.com/Pugavkomm/react-native-simple-image-compressor/commit/ac1fdc14d2f168cf7a3a4204e4b6af9125171c09))
* **android:** add proguard consumer rules ([#23](https://github.com/Pugavkomm/react-native-simple-image-compressor/issues/23)) ([29d85b9](https://github.com/Pugavkomm/react-native-simple-image-compressor/commit/29d85b9f63cad6e117055813baac0a8c6bb851b5))

# [0.2.0-alpha.4](https://github.com/Pugavkomm/react-native-simple-image-compressor/compare/v0.2.0-alpha.3...v0.2.0-alpha.4) (2026-07-20)

# [0.2.0-alpha.3](https://github.com/Pugavkomm/react-native-simple-image-compressor/compare/v0.2.0-alpha.2...v0.2.0-alpha.3) (2026-07-20)


### Bug Fixes

* **android:** fix schemes issues in `openStream` and `resolveUri` ([#14](https://github.com/Pugavkomm/react-native-simple-image-compressor/issues/14)) ([2fc2b04](https://github.com/Pugavkomm/react-native-simple-image-compressor/commit/2fc2b04f7b048662192a79945c2bbc1f5d48146c))
* **ios:** prevent silent failures in `WebEncoder` and fix typos ([#16](https://github.com/Pugavkomm/react-native-simple-image-compressor/issues/16)) ([171808a](https://github.com/Pugavkomm/react-native-simple-image-compressor/commit/171808a6004371f7949557722f8e2671b3636228))


### Features

* add `format` and `fileSize` to `CompressedResult` ([#18](https://github.com/Pugavkomm/react-native-simple-image-compressor/issues/18)) ([25acf72](https://github.com/Pugavkomm/react-native-simple-image-compressor/commit/25acf729864473cc9112b05944d19ef654f34a7c))

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
