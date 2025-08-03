// src/model/data/index.js

const useAws = process.env.FRAGMENTS_DB_TYPE === 'aws';
module.exports = useAws ? require('./aws') : require('./memory-db');
