const s3Client = require('./s3Client');
const ddbDocClient = require('./ddbDocClient');
const {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const {
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');
const logger = require('../../../logger');

const bucketName = process.env.AWS_S3_BUCKET_NAME;

// Write fragment metadata to DynamoDB
function writeFragment(fragment) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Item: fragment,
  };
  const command = new PutCommand(params);
  try {
    return ddbDocClient.send(command);
  } catch (err) {
    logger.warn({ err, params, fragment }, 'Error writing fragment metadata to DynamoDB');
    throw err;
  }
}

// Read fragment metadata from DynamoDB
async function readFragment(ownerId, id) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Key: { ownerId, id },
  };
  const command = new GetCommand(params);
  try {
    const data = await ddbDocClient.send(command);
    return data?.Item;
  } catch (err) {
    logger.warn({ err, params }, 'Error reading fragment metadata from DynamoDB');
    throw err;
  }
}

// Upload fragment data to S3
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

// Read raw S3 stream into Buffer
const streamToBuffer = (stream) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });

// Read fragment data from S3
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

// Delete fragment data from S3
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

// List fragments (ids or full metadata) for a user
async function listFragments(ownerId, expand = false) {
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    KeyConditionExpression: 'ownerId = :ownerId',
    ExpressionAttributeValues: {
      ':ownerId': ownerId,
    },
  };

  if (!expand) {
    params.ProjectionExpression = 'id';
  }

  const command = new QueryCommand(params);
  try {
    const data = await ddbDocClient.send(command);
    return !expand ? data?.Items.map((i) => i.id) : data?.Items;
  } catch (err) {
    logger.error({ err, params }, 'Error listing fragments from DynamoDB');
    throw err;
  }
}

// Delete fragment metadata (DynamoDB) and data (S3)
async function deleteFragment(ownerId, id) {
  // Delete fragment data from S3
  try {
    await deleteFragmentData(ownerId, id);
  } catch (err) {
    logger.warn({ err, ownerId, id }, 'Error deleting fragment data from S3');
  }

  // Delete metadata from DynamoDB
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Key: { ownerId, id },
  };
  const command = new DeleteCommand(params);
  try {
    await ddbDocClient.send(command);
  } catch (err) {
    logger.warn({ err, params }, 'Error deleting fragment metadata from DynamoDB');
    throw err;
  }
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
