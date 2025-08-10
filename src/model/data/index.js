// src/model/data/index.js

const useAws = process.env.FRAGMENTS_DB_TYPE === 'aws';

if (useAws) {
  module.exports = require('./aws');
} else {
  // Wrap memory-db with exports to match aws module API
  const MemoryDB = require('./memory-db');
  const db = new MemoryDB();

  module.exports = {
    // Metadata
    writeFragment: (fragment) => db.put(fragment.ownerId, fragment.id, fragment),
    readFragment: (ownerId, id) => db.get(ownerId, id),
    deleteFragment: async (ownerId, id) => {
      await db.del(ownerId, id);
      try {
        await db.del(ownerId, `${id}:data`);
      } catch { /* ignore */ }
      
    },
    listFragments: async (ownerId, expand = false) => {
      const all = await db.query(ownerId);
      const metas = all.filter((v) => v && typeof v === 'object' && !Buffer.isBuffer(v) && v.id);
      return expand ? metas : metas.map((m) => m.id);
    },
    
    

    // Data
    writeFragmentData: (ownerId, id, buffer) => db.put(ownerId, `${id}:data`, buffer),
    readFragmentData: (ownerId, id) => db.get(ownerId, `${id}:data`),
    deleteFragmentData: (ownerId, id) => db.del(ownerId, `${id}:data`)
  };
}