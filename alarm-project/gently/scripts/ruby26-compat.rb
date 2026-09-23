# Makes the Ruby that macOS ships (2.6.10) usable for this project's iOS
# toolchain. Loaded through RUBYOPT by scripts/pod.sh, never by the app.
#
# Two unrelated breakages, both of which stop `pod install` dead.

require 'rbconfig'

# 1. Native gems could not compile at all.
#
# Xcode 27's SDK ships the Ruby 2.6 headers under `universal-darwin26`, but
# this Ruby reports its own arch as `universal-darwin25`. mkmf then writes a
# Makefile whose prerequisite is a `config.h` at a path that does not exist,
# and every native gem dies with "No rule to make target". That is the
# CocoaPods blocker recorded in step 17 — one mismatched directory name, not
# the missing headers it looked like.
#
# Only `rubyarchhdrdir` is redirected, so gems still install where Ruby looks
# for them.
sdk_headers = File.join(RbConfig::CONFIG['rubyhdrdir'], 'universal-darwin26')

if File.directory?(sdk_headers)
  RbConfig::CONFIG['rubyarchhdrdir'] = sdk_headers
  RbConfig::MAKEFILE_CONFIG['rubyarchhdrdir'] = sdk_headers
end

# 2. Expo's autolinking scripts are written for Ruby 2.7.
#
# `Enumerable#filter_map` arrived in 2.7, and expo-modules-autolinking uses it
# to read the precompiled-framework configs. Without it every one of those
# reads throws, Expo falls back to "all modules will build from source", and a
# build that should take minutes takes the better part of an hour.
#
# Defined on Enumerable rather than Array so it is found by anything that
# includes it, and only when the running Ruby genuinely lacks it.
unless [].respond_to?(:filter_map)
  module Enumerable
    def filter_map
      return to_enum(:filter_map) unless block_given?

      each_with_object([]) do |element, kept|
        mapped = yield(element)
        kept << mapped if mapped
      end
    end
  end
end
