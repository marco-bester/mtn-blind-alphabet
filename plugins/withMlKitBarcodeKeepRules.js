const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('@expo/config-plugins');

const marker = '# ML Kit barcode component registrars';
const rules = [
  marker,
  '-keep class com.google.mlkit.common.internal.CommonComponentRegistrar { public <init>(); }',
  '-keep class com.google.mlkit.vision.barcode.internal.BarcodeRegistrar { public <init>(); }',
  '-keep class com.google.mlkit.vision.common.internal.VisionCommonRegistrar { public <init>(); }',
].join('\n');

module.exports = (config) => withDangerousMod(config, ['android', async (config) => {
  const rulesPath = path.join(config.modRequest.platformProjectRoot, 'app', 'proguard-rules.pro');
  const existingRules = await fs.promises.readFile(rulesPath, 'utf8');

  if (!existingRules.includes(marker)) {
    await fs.promises.writeFile(rulesPath, `${existingRules.trimEnd()}\n\n${rules}\n`);
  }

  return config;
}]);
