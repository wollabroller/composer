import type { Plugin } from '../types.ts';

export default {
  composerName: 'wp-seopress-pro/wp-seopress-pro',

  async download() {
    const version = await getLatestVersion();

    const url = `https://www.seopress.org/?${new URLSearchParams({
      edd_composer_download: '1',
      license_key: process.env.SEOPRESS_LICENSE_KEY!,
      version,
      lang: 'en',
      url: 'https://wollabroller.de',
    })}}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`SEOPress download failed: ${response.status}`);
    }

    return Buffer.from(await response.arrayBuffer());
  },

  async detectVersion() {
    return getLatestVersion();
  },
} satisfies Plugin;

async function getLatestVersion() {
  const url = `https://www.seopress.org/?${new URLSearchParams({
    edd_action: 'get_version',
    item_id: '0',
    license: process.env.SEOPRESS_LICENSE_KEY!,
    url: 'https://wollabroller.de',
  })}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`SEOPress version check failed: ${response.status}`);
  }

  const data = await response.json();

  if (!data.new_version) {
    throw new Error(`Invalid SEOPress response: ${JSON.stringify(data)}`);
  }

  return data.new_version;
}
