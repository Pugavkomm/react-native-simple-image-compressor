require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "SimpleImageCompressor"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/Pugavkomm/react-native-simple-image-compressor.git", :tag => "#{s.version}" }



  s.default_subspec = 'Core'

  s.subspec 'Core' do |ss|
    ss.source_files = [
      "ios/**/*.{swift}",
      "ios/**/*.{m,mm}",
      "cpp/**/*.{hpp,cpp}",
    ]

    ss.dependency 'React-jsi'
    ss.dependency 'React-callinvoker'
  end

  s.subspec 'WebP' do |ss|
    ss.dependency 'SimpleImageCompressor/Core'
    ss.dependency 'libwebp', '~> 1.5.0'
  end

  load 'nitrogen/generated/ios/SimpleImageCompressor+autolinking.rb'
  add_nitrogen_files(s)
  install_modules_dependencies(s)
end
