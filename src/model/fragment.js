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
    const items = await listFragments(ownerId, expand);
    if (!expand) return items; // array of ids
  
    // If the data layer didn’t give us ids, fetch the ids explicitly
    const ids = Array.isArray(items) && items.length && typeof items[0] === 'string'
      ? items
      : await listFragments(ownerId, false);
  
    if (!ids || ids.length === 0) return [];
  
    const metas = await Promise.all(ids.map((id) => readFragment(ownerId, id)));
    return metas.filter(Boolean).map((m) => new Fragment(m));
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
    return this.mimeType.startsWith('text/') || this.mimeType === 'application/json';
  }
  
  get formats() {
    const t = this.mimeType;
  
    // Text & JSON: model only reports the original type
    if (t.startsWith('text/') || t === 'application/json') {
      return [t];
    }
  
    // Images: multiple output formats supported
    if (t === 'image/png')  return ['image/png', 'image/jpeg', 'image/webp'];
    if (t === 'image/jpeg') return ['image/jpeg', 'image/png', 'image/webp'];
    if (t === 'image/webp') return ['image/webp', 'image/png', 'image/jpeg'];
    if (t === 'image/gif')  return ['image/gif'];
  
    return [t];
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