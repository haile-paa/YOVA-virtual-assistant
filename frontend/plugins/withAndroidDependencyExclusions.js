const { withAppBuildGradle } = require("expo/config-plugins");

// Some older native modules (react-native-voice in particular) still pull in
// the entire pre-AndroidX "com.android.support" family as a real transitive
// dependency, not just an AAR that needs jetifying. Jetifier alone doesn't
// always collapse that into the AndroidX equivalents already present, which
// is what produces "Duplicate class ... found in modules" (during
// :app:checkReleaseDuplicateClasses) and "2 files found with path
// 'META-INF/...'" (during :app:mergeReleaseJavaResource) failures - one
// artifact at a time (support-compat, versionedparcelable, customview, and
// potentially more: coordinatorlayout, loader, viewpager, etc., since
// they're all part of the same legacy bundle). Excluding the whole group
// wholesale avoids fixing these one at a time across repeated build cycles.
const EXCLUSIONS_BLOCK = `
configurations.all {
    exclude group: 'com.android.support'
}
`;

module.exports = function withAndroidDependencyExclusions(config) {
  return withAppBuildGradle(config, (config) => {
    if (
      !config.modResults.contents.includes(
        "exclude group: 'com.android.support'",
      )
    ) {
      config.modResults.contents += EXCLUSIONS_BLOCK;
    }
    return config;
  });
};
