import unzipper from 'unzipper';
import type { Plugin } from '../types.ts';

export default {
  composerName: 'creativethemes/blocksy-companion-pro',

  async download() {
    const response = await fetch(
      `https://api.freemius.com/v1/users/${process.env.BLOCKSY_USER_ID!}/plugins/5115/updates/latest.zip?authorization=${process.env.BLOCKSY_LICENSE_KEY!}&is_premium=true`,
    );
    return Buffer.from(await response.arrayBuffer());
  },

  async detectVersion(zip) {
    const archive = await unzipper.Open.buffer(zip);

    const file = archive.files.find((file) => file.path.endsWith('/blocksy-companion.php'));

    if (!file) {
      throw new Error('Plugin file missing');
    }

    const content = (await file.buffer()).toString();

    const match = content.match(/^Version:\s*(.+)$/m);

    if (!match) {
      throw new Error('Version missing');
    }

    return match[1].trim();
  },
} satisfies Plugin;
