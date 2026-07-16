package com.margelo.nitro.simpleimagecompressor

import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.core.Promise

@DoNotStrip
class SimpleImageCompressor : HybridSimpleImageCompressorSpec() {
  override fun compressImage(uri: String, options: CompressOptions): Promise<CompressedResult> {
    return Promise.async {
      SimpleCompressorService.compress(
        uri,
        options.quality,
        options.maxWidth?.toInt(),
        options.maxHeight?.toInt(),
        options.format,
         options.enablePhysicalRotation == true

      )
    }
  }
}
