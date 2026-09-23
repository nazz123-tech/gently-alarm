#!/bin/sh
# CocoaPods on this machine, with the three things it needs to run at all.
#
# 1. Gems installed with `--user-install` land in ~/.gem, which is not on the
#    default PATH, so `bundle` is not found from a clean shell.
# 2. Native gems only compile with the SDK header fix alongside this file.
# 3. `pod install` has to run in ios/, so the Gemfile is named by absolute
#    path rather than found by walking up from the working directory.
#
# The working directory is left alone, so `npm run pod -- install` works from
# the project root and from ios/ alike.
set -e
root=$(cd "$(dirname "$0")/.." && pwd)
export PATH="$HOME/.gem/ruby/2.6.0/bin:$PATH"
export RUBYOPT="-r$root/scripts/ruby26-compat.rb"
export BUNDLE_GEMFILE="$root/Gemfile"
exec bundle exec pod "$@"
