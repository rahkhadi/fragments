#!/bin/bash

set -e

echo ""
echo "Setting AWS environment variables for LocalStack..."

export AWS_ACCESS_KEY_ID="test"
export AWS_SECRET_ACCESS_KEY="test"
export AWS_REGION="us-east-1"

# Wait for LocalStack S3 to be ready by polling `s3 ls`
echo "Waiting for LocalStack S3 to be ready..."
until aws --endpoint-url=http://localhost:4566 s3 ls >/dev/null 2>&1; do
  echo "⏳ Waiting for S3..."
  sleep 2
done
echo "✅ LocalStack S3 is Ready"

# Create S3 bucket (ignore error if exists)
echo "Creating LocalStack S3 bucket: fragments"
aws --endpoint-url=http://localhost:4566 s3api create-bucket --bucket fragments || echo "⚠️ Bucket may already exist"

# Create DynamoDB table (ignore error if exists)
echo "Creating DynamoDB-Local table: fragments"
aws --endpoint-url=http://localhost:8000 dynamodb create-table \
  --region us-east-1 \
  --table-name fragments \
  --attribute-definitions AttributeName=ownerId,AttributeType=S AttributeName=id,AttributeType=S \
  --key-schema AttributeName=ownerId,KeyType=HASH AttributeName=id,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  > /dev/null && echo "✅ Table created" || echo "⚠️ Table may already exist"


# Confirm creation
echo ""
echo "📋 Tables in DynamoDB:"
aws --endpoint-url=http://localhost:8000 dynamodb list-tables --region us-east-1

echo ""
echo "📋 Buckets in S3:"
aws --endpoint-url=http://localhost:4566 s3 ls
