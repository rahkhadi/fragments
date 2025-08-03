// fragments/src/model/data/aws/index.js

const MemoryDB = require('../memory-db');
const s3Client = require('./s3Client');
const {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const logger = require('../../../logger');

const data = new MemoryDB(); // Metadata (ID, owner, type, etc.)
const bucketName = process.env.AWS_S3_BUCKET_NAME;

/**
 * Write fragment metadata (in-memory).
 */
function writeFragment(fragment) {
  return data.put(fragment.ownerId, fragment.id, fragment);
}

/**
 * Read fragment metadata (from memory).
 */
async function readFragment(ownerId, id) {
  const serialized = await data.get(ownerId, id);
  return typeof serialized === 'string' ? JSON.parse(serialized) : serialized;
}

/**
 * Upload raw fragment data to S3.
 */
async function writeFragmentData(ownerId, id, buffer) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: `${ownerId}/${id}`,
    Body: buffer,
  });
  try {
    await s3Client.send(command);
  } catch (err) {
    logger.error({ err }, 'Error writing to S3');
    throw new Error(`❌ S3 Upload Error: ${err.message}`);
  }
}

/**
 * Helper to read S3 stream into Buffer.
 */
const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

/**
 * Read raw fragment data from S3.
 */
async function readFragmentData(ownerId, id) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: `${ownerId}/${id}`,
  });
  try {
    const response = await s3Client.send(command);
    return await streamToBuffer(response.Body);
  } catch (err) {
    logger.error({ err }, 'Error reading from S3');
    throw new Error('Unable to read fragment data');
  }
}

/**
 * Delete raw fragment data from S3.
 */
async function deleteFragmentData(ownerId, id) {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: `${ownerId}/${id}`,
  });
  try {
    await s3Client.send(command);
  } catch (err) {
    logger.error({ err }, 'Error deleting from S3');
    throw new Error('Unable to delete fragment data');
  }
}

/**
 * List fragment IDs or full metadata for a user.
 */
async function listFragments(ownerId, expand = false) {
  try {
    const all = await data.query(ownerId) || [];
    console.log('📦 listFragments raw metadata:', all);

    const result = all
      .map((f) => (expand ? f : f.id))
      .filter(Boolean);

    console.log('✅ listFragments parsed result:', result);
    return result;
  } catch (err) {
    console.error('❌ listFragments failed:', err);
    throw new Error('Error listing fragments');
  }
}


/**
 * Delete both metadata and data for a fragment.
 */
async function deleteFragment(ownerId, id) {
  await data.del(ownerId, id);
  return deleteFragmentData(ownerId, id);
}

module.exports = {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  deleteFragmentData,
  listFragments,
  deleteFragment,
};
