// ✅ fragments/src/model/data/aws/s3Client.js
const { S3Client } = require('@aws-sdk/client-s3');
const logger = require('../../../logger');

const shouldUseLocalstack = !!process.env.AWS_S3_ENDPOINT_URL;

const getCredentials = () => {
  // For LocalStack, any static creds are fine (and sometimes required)
  if (shouldUseLocalstack) {
    return {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
      sessionToken: process.env.AWS_SESSION_TOKEN || 'test',
    };
  }
  // In AWS (ECS/EKS/EC2), return undefined so the SDK uses the IAM role
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    return {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      sessionToken: process.env.AWS_SESSION_TOKEN,
    };
  }
  return undefined;
};

const getS3Endpoint = () => {
  if (process.env.AWS_S3_ENDPOINT_URL) {
    logger.debug({ endpoint: process.env.AWS_S3_ENDPOINT_URL }, 'Using alternate S3 endpoint');
    return process.env.AWS_S3_ENDPOINT_URL;
  }
  return undefined;
};

module.exports = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: getS3Endpoint(),
  credentials: getCredentials(),   // undefined on AWS ⇒ uses role
  forcePathStyle: !!process.env.AWS_S3_ENDPOINT_URL,
});
