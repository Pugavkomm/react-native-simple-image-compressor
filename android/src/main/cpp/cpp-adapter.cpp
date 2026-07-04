#include <jni.h>
#include "simpleimagecompressorOnLoad.hpp"

#include <fbjni/fbjni.h>


JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return facebook::jni::initialize(vm, []() {
    margelo::nitro::simpleimagecompressor::registerAllNatives();
  });
}