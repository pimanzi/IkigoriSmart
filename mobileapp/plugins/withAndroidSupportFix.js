const { withProjectBuildGradle, withGradleProperties } = require('@expo/config-plugins');

/**
 * Fixes duplicate class conflict caused by @react-native-voice/voice pulling in
 * old com.android.support libraries alongside AndroidX.
 */
const withAndroidSupportFix = (config) => {
  // 1. Enable Jetifier in gradle.properties
  config = withGradleProperties(config, (config) => {
    config.modResults = config.modResults.filter(
      (item) => !(item.type === 'property' && item.key === 'android.enableJetifier')
    );
    config.modResults.push({
      type: 'property',
      key: 'android.enableJetifier',
      value: 'true',
    });
    return config;
  });

  // 2. Exclude old Support Library from all dependency configs in build.gradle
  config = withProjectBuildGradle(config, (config) => {
    const contents = config.modResults.contents;

    const exclusionBlock = `
  configurations.all {
    exclude group: 'com.android.support', module: 'support-compat'
    exclude group: 'com.android.support', module: 'versionedparcelable'
    exclude group: 'com.android.support', module: 'support-annotations'
  }`;

    // Only add if not already present
    if (!contents.includes("exclude group: 'com.android.support'")) {
      config.modResults.contents = contents.replace(
        /(allprojects\s*\{[\s\S]*?repositories\s*\{[\s\S]*?\})/,
        `$1${exclusionBlock}`
      );
    }

    return config;
  });

  return config;
};

module.exports = withAndroidSupportFix;
