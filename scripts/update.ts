import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import blocksyCompanionPro from '../src/plugins/blocksy-companion-pro.ts';
import polylangPro from '../src/plugins/polylang-pro.ts';
import polylangWc from '../src/plugins/polylang-wc.ts';
import wpSeopressPro from '../src/plugins/wp-seopress-pro.ts';
import type { Package, Plugin } from '../src/types.ts';

const distPath = path.resolve('dist');
const packagesPath = path.resolve('packages.json');

async function savePlugin(plugin: Plugin, version: string, zip: Buffer) {
  await mkdir(distPath, {
    recursive: true,
  });

  const filename = `${path.basename(plugin.composerName)}-${version}.zip`;

  const filepath = path.join(distPath, filename);

  if (!existsSync(filepath)) {
    await writeFile(filepath, zip);
    console.log(`Saved ${filename}`);
  } else {
    console.log(`${filename} already exists`);
  }

  await updatePackagesJson(plugin, version, filename);
}

async function updatePackagesJson(plugin: Plugin, version: string, filename: string) {
  let packages: {
    packages: Record<string, Record<string, Package>>;
  } = {
    packages: {},
  };

  if (existsSync(packagesPath)) {
    packages = JSON.parse(await readFile(packagesPath, 'utf8'));
  }

  const packageVersions = packages.packages[plugin.composerName] ?? {};

  if (packageVersions[version]) {
    return;
  }

  packageVersions[version] = {
    name: plugin.composerName,
    version,
    type: 'wordpress-plugin',
    dist: {
      url: `https://raw.githubusercontent.com/wollabroller/composer/main/dist/${filename}`,
      type: 'zip',
    },
  };

  await writeFile(packagesPath, JSON.stringify(packages, null, 2) + '\n');

  console.log(`Updated packages.json: ${plugin.composerName}@${version}`);
}

const plugins: Plugin[] = [blocksyCompanionPro, polylangPro, polylangWc, wpSeopressPro];

for (const plugin of plugins) {
  const zip = await plugin.download();

  const version = await plugin.detectVersion(zip);

  await savePlugin(plugin, version, zip);
}
