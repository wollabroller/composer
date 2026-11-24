import type { Plugin } from '../types.ts';

export default {
  composerName: 'polylang/polylang-wc',

  async download() {
    const version = await getLatestVersion();

    const url = `https://polylang.pro/?${new URLSearchParams({
      edd_composer_download: '1',
      license_key: process.env.POLYLANG_LICENSE_KEY!,
      version,
      lang: 'en',
      url: 'https://wollabroller.de',
    })}}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Polylang Pro download failed: ${response.status}`);
    }

    return Buffer.from(await response.arrayBuffer());
  },

  async detectVersion() {
    return getLatestVersion();
  },
} satisfies Plugin;

async function getLatestVersion() {
  const url = `https://polylang.pro/?${new URLSearchParams({
    edd_action: 'get_version',
    item_name: 'Polylang for WooCommerce',
    license: process.env.POLYLANG_LICENSE_KEY!,
    url: 'https://wollabroller.de',
  })}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Polylang Pro version check failed: ${response.status}`);
  }

  const data = await response.json();

  if (!data.new_version) {
    throw new Error(`Invalid Polylang Pro response: ${JSON.stringify(data)}`);
  }

  return data.new_version;
}
