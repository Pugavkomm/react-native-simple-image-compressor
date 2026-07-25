package com.margelo.nitro.simpleimagecompressor

import android.content.Context
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise


@DoNotStrip
class SimpleImageCompressor : HybridSimpleImageCompressorSpec() {

  private fun getContext(): Context {
    val context =
      NitroModules.applicationContext ?: throw Exception("Nitromodule.applicationContext is null")
    return context
  }

  override fun getFileSize(uri: String): Promise<Double> {
    return Promise.async {

      val sourceUri = getCleanUri(uri)
      val context = getContext()
      fetchFileSizeByUri(context, sourceUri).toDouble()
    }
  }

  override fun compressImage(uri: String, options: CompressOptions): Promise<CompressedResult> {
    return Promise.async {
      val context = getContext()

      SimpleCompressorService.compress(
        context,
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
