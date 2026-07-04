package com.margelo.nitro.simpleimagecompressor
  
import com.facebook.proguard.annotations.DoNotStrip

@DoNotStrip
class SimpleImageCompressor : HybridSimpleImageCompressorSpec() {
  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }
}
