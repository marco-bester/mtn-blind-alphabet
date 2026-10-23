const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const keyDirectory = path.join(os.homedir(), '.android', 'keystores');
const keyPath = path.join(keyDirectory, 'blind-alphabet-play-upload.p12');
const gradleDirectory = path.join(os.homedir(), '.gradle');
const propertiesPath = path.join(gradleDirectory, 'gradle.properties');
const keyAlias = 'blind-alphabet-play-upload';

assert.ok(!fs.existsSync(keyPath), 'Upload keystore already exists; refusing to replace it.');
assert.ok(!fs.existsSync(propertiesPath), 'User Gradle properties already exist; configure signing manually to preserve them.');

fs.mkdirSync(keyDirectory, { recursive: true, mode: 0o700 });
fs.mkdirSync(gradleDirectory, { recursive: true, mode: 0o700 });

const password = randomBytes(32).toString('hex');
const properties = [
  `MYAPP_UPLOAD_STORE_FILE=${keyPath}`,
  `MYAPP_UPLOAD_STORE_PASSWORD=${password}`,
  `MYAPP_UPLOAD_KEY_ALIAS=${keyAlias}`,
  `MYAPP_UPLOAD_KEY_PASSWORD=${password}`,
  '',
].join('\n');

fs.writeFileSync(propertiesPath, properties, { flag: 'wx', mode: 0o600 });

const result = spawnSync('keytool', [
  '-genkeypair',
  '-keystore', keyPath,
  '-storetype', 'PKCS12',
  '-alias', keyAlias,
  '-keyalg', 'RSA',
  '-keysize', '2048',
  '-validity', '10000',
  '-dname', 'CN=Marco Bester',
  '-storepass:env', 'BLIND_ALPHABET_KEY_PASSWORD',
  '-keypass:env', 'BLIND_ALPHABET_KEY_PASSWORD',
], {
  env: { ...process.env, BLIND_ALPHABET_KEY_PASSWORD: password },
  stdio: 'inherit',
});

if (result.error || result.status !== 0) {
  console.error('Key generation failed. Signing properties were preserved; inspect the local setup before retrying.');
  process.exit(1);
}

fs.chmodSync(keyPath, 0o600);
console.log(`Upload keystore created: ${keyPath}`);
console.log(`Signing configured: ${propertiesPath}`);
console.log('Back up both files securely. Neither file belongs in source control.');