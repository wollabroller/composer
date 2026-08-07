import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const LICENSE_KEY = process.env.SEOPRESS_LICENSE_KEY;
const SITE_URL = 'https://wollabroller.de';

const distPath = path.resolve('dist');
const packagesPath = path.resolve('packages.json');

if (!LICENSE_KEY) {
  throw new Error('Missing SEOPRESS_LICENSE_KEY');
}

await mkdir(distPath, { recursive: true });

const response = await fetch(
  `https://www.seopress.org/?${new URLSearchParams({
    edd_action: 'get_version',
    item_id: '0',
    license: LICENSE_KEY,
    url: SITE_URL,
  })}`,
);

if (!response.ok) {
  throw new Error(`HTTP ${response.status}`);
}

const versionInfo = await response.json();
const version: string = versionInfo.new_version;

if (!version) {
  throw new Error('Could not determine latest version');
}

const zipPath = path.join(distPath, `wp-seopress-pro-${version}.zip`);

if (!existsSync(zipPath)) {
  console.log(`Downloading ${version}...`);

  const zipResponse = await fetch(
    `https://www.seopress.org/?${new URLSearchParams({
      edd_composer_download: '1',
      license_key: LICENSE_KEY,
      version,
      lang: 'en',
      url: SITE_URL,
    })}`,
  );

  if (!zipResponse.ok) {
    throw new Error(`Download failed (${zipResponse.status})`);
  }

  const buffer = Buffer.from(await zipResponse.arrayBuffer());

  await writeFile(zipPath, buffer);
}

let packages: {
  packages: Record<
    string,
    Record<
      string,
      {
        name: string;
        version: string;
        type: 'wordpress-plugin';
        dist: {
          url: string;
          type: 'zip';
        };
      }
    >
  >;
} = {
  packages: {
    'wp-seopress-pro/wp-seopress-pro': {},
  },
};

if (existsSync(packagesPath)) {
  packages = JSON.parse(await readFile(packagesPath, 'utf8'));
}

packages.packages['wp-seopress-pro/wp-seopress-pro'][version] = {
  name: 'wp-seopress-pro/wp-seopress-pro',
  version,
  type: 'wordpress-plugin',
  dist: {
    url: `https://raw.githubusercontent.com/wollabroller/composer/main/dist/wp-seopress-pro-${version}.zip`,
    type: 'zip',
  },
};

await writeFile(packagesPath, JSON.stringify(packages, null, 2) + '\n');

console.log(`SEOPress ${version} is available.`);
