const { withXcodeProject } = require('expo/config-plugins');

/**
 * Keeps the signing team through a prebuild.
 *
 * The team is written into ios/Gently.xcodeproj, and ios/ is generated and
 * gitignored — so `expo prebuild --clean` throws it away and the next device
 * build fails with a signing error that looks like something broke. Adding the
 * widget extension will mean regenerating that folder more than once, so it is
 * set here instead, where it survives.
 *
 * A team id is not a secret; it appears in every app someone ships. Override
 * with APPLE_TEAM_ID to build on a different account.
 */
const TEAM_ID = process.env.APPLE_TEAM_ID ?? '5HDVXKL5QR';

module.exports = function withSigningTeam(config) {
  return withXcodeProject(config, (config) => {
    const buildConfigurations = config.modResults.pbxXCBuildConfigurationSection();

    for (const entry of Object.values(buildConfigurations)) {
      // The section holds comment entries alongside real ones, and only the
      // app targets carry a bundle id — the Pods configurations do not want a
      // team and setting one on them does nothing good.
      if (!entry?.buildSettings?.PRODUCT_BUNDLE_IDENTIFIER) continue;

      entry.buildSettings.DEVELOPMENT_TEAM = TEAM_ID;
    }

    return config;
  });
};
