// src/model/data/aws/ddbDocClient.js
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const clientOpts = {
  region: process.env.AWS_REGION || 'us-east-1',
};

// Alt endpoint for LocalStack only if set
if (process.env.AWS_DYNAMODB_ENDPOINT_URL) {
  clientOpts.endpoint = process.env.AWS_DYNAMODB_ENDPOINT_URL;
}

// Use explicit creds only if you actually set them
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  clientOpts.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  };
}

const ddbClient = new DynamoDBClient(clientOpts);

module.exports = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: {
    convertEmptyValues: false,
    removeUndefinedValues: false,
    convertClassInstanceToMap: true,
  },
  unmarshallOptions: { wrapNumbers: false },
});
