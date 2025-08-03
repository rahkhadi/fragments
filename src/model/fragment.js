// fragments/src/model/fragment.js
const { randomUUID } = require('crypto');
const contentType = require('content-type');
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    if (!ownerId || !type) throw new Error('ownerId and type are required');
    if (typeof size !== 'number' || size < 0) throw new Error('size must be a non-negative number');
    if (!Fragment.isSupportedType(type)) throw new Error(`Unsupported type: ${type}`);

    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.type = type;
    this.size = size;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
  }

  static async byUser(ownerId, expand = false) {
    const results = await listFragments(ownerId, expand);
    return expand ? results.map((f) => new Fragment(f)) : results;
  }

  static async byId(ownerId, id) {
    const data = await readFragment(ownerId, id);
    if (!data) throw new Error('Fragment not found');
    return new Fragment(data);
  }

  static delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  save() {
    this.updated = new Date().toISOString();
    return writeFragment(this);
  }

  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  async setData(data) {
    if (!Buffer.isBuffer(data)) throw new Error('Data must be a Buffer');
    this.updated = new Date().toISOString();
    this.size = data.length;
    await writeFragmentData(this.ownerId, this.id, data);
    await this.save();
  }

  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  get isText() {
    return this.mimeType.startsWith('text/');
  }

  get formats() {
    return [this.mimeType];
  }

  static isSupportedType(value) {
    const { type } = contentType.parse(value);
    const supportedTypes = [
      'text/plain',
      'text/markdown',
      'text/html',
      'application/json',
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/gif',
    ];
    return supportedTypes.includes(type);
  }
}

module.exports.Fragment = Fragment;
