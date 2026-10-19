const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('@expo/config-plugins');

const marker = '// Huawei release signing configuration';
const guardMarker = '// Huawei release signing validation';
const preflightMarker = '// Huawei release signing preflight';
const releaseSigningError = 'Release signing is not configured. Set MYAPP_UPLOAD_STORE_FILE, MYAPP_UPLOAD_STORE_PASSWORD, MYAPP_UPLOAD_KEY_ALIAS, and MYAPP_UPLOAD_KEY_PASSWORD in your user Gradle properties.';
const releasePreflight = [
  preflightMarker,
  'def releasePackagingRequested = gradle.startParameter.taskNames.any { taskName ->',
  "    def normalizedTask = taskName.toLowerCase()",
  "    normalizedTask.endsWith('assemblerelease') || normalizedTask.endsWith('packagerelease') || normalizedTask.endsWith('bundlerelease')",
  '}',
  'if (releasePackagingRequested && !hasReleaseSigning) {',
  `    throw new GradleException('${releaseSigningError}')`,
  '}',
  '',
].join('\n');
const signingGuard = [
  guardMarker,
  "tasks.configureEach {",
  "    if (name == 'packageRelease' || name == 'bundleRelease') {",
  '        doFirst {',
  '            if (!hasReleaseSigning) {',
  `                throw new GradleException('${releaseSigningError}')`,
  '            }',
  '        }',
  '    }',
  '}',
  '',
].join('\n');

module.exports = (config) => withDangerousMod(config, ['android', async (config) => {
  const gradlePath = path.join(config.modRequest.platformProjectRoot, 'app', 'build.gradle');
  let gradle = await fs.promises.readFile(gradlePath, 'utf8');

  if (!gradle.includes(marker)) {
    gradle = gradle.replace(
      "def enableMinifyInReleaseBuilds = (findProperty('android.enableMinifyInReleaseBuilds') ?: false).toBoolean()",
      `${marker}\ndef releaseStoreFile = findProperty('MYAPP_UPLOAD_STORE_FILE')\ndef releaseStorePassword = findProperty('MYAPP_UPLOAD_STORE_PASSWORD')\ndef releaseKeyAlias = findProperty('MYAPP_UPLOAD_KEY_ALIAS')\ndef releaseKeyPassword = findProperty('MYAPP_UPLOAD_KEY_PASSWORD')\ndef hasReleaseSigning = [releaseStoreFile, releaseStorePassword, releaseKeyAlias, releaseKeyPassword].every { it }\ndef enableMinifyInReleaseBuilds = (findProperty('android.enableMinifyInReleaseBuilds') ?: false).toBoolean()`
    );

    gradle = gradle.replace(
      /    signingConfigs \{\n        debug \{\n[\s\S]*?\n        \}\n    \}/,
      (block) => `${block.slice(0, -5)}\n        release {\n            if (hasReleaseSigning) {\n                storeFile file(releaseStoreFile)\n                storePassword releaseStorePassword\n                keyAlias releaseKeyAlias\n                keyPassword releaseKeyPassword\n            }\n        }\n    }`
    );

    gradle = gradle.replace(
      /(buildTypes \{[\s\S]*?release \{[\s\S]*?)signingConfig signingConfigs\.debug/,
      '$1signingConfig signingConfigs.release'
    );

  }

  if (!gradle.includes(guardMarker)) {
    const anchor = gradle.indexOf('// Apply static values from');
    if (anchor === -1) throw new Error('Could not locate Android Gradle properties section for release signing validation.');
    gradle = `${gradle.slice(0, anchor)}${signingGuard}${gradle.slice(anchor)}`;
  }

  if (!gradle.includes(preflightMarker)) {
    const anchor = gradle.indexOf('def hasReleaseSigning =');
    const lineEnd = gradle.indexOf('\n', anchor);
    if (anchor === -1 || lineEnd === -1) throw new Error('Could not locate release signing properties for the preflight check.');
    gradle = `${gradle.slice(0, lineEnd + 1)}${releasePreflight}${gradle.slice(lineEnd + 1)}`;
  }

  await fs.promises.writeFile(gradlePath, gradle);

  return config;
}]);