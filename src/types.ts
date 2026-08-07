export interface Plugin {
  composerName: string;
  download(): Promise<Buffer>;
  detectVersion(zip: Buffer): Promise<string>;
}

export interface Package {
  name: string;
  version: string;
  type: 'wordpress-plugin';
  dist: {
    url: string;
    type: 'zip';
  };
}
