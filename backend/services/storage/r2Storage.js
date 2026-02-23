const crypto = require('crypto');
const path = require('path');
const mime = require('mime-types');
const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET;
const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL || '';

const isR2Configured = Boolean(
  R2_ACCOUNT_ID &&
  R2_ACCESS_KEY_ID &&
  R2_SECRET_ACCESS_KEY &&
  R2_BUCKET
);

let s3Client = null;

function getClient() {
  if (!isR2Configured) {
    return null;
  }

  if (!s3Client) {
    s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY
      }
    });
  }

  return s3Client;
}

function buildObjectKey(folder, originalName) {
  const extension = path.extname(originalName || '') || '';
  const hash = crypto.randomBytes(10).toString('hex');
  const safeFolder = folder || 'materials';
  return `${safeFolder}/${Date.now()}-${hash}${extension}`;
}

function inferContentType(fileName, explicit) {
  if (explicit) return explicit;
  return mime.lookup(fileName) || 'application/octet-stream';
}

function publicUrlFor(objectKey) {
  if (!objectKey) return null;
  if (R2_PUBLIC_BASE_URL) {
    return `${R2_PUBLIC_BASE_URL.replace(/\/$/, '')}/${objectKey}`;
  }
  return null;
}

async function uploadBuffer({ buffer, originalName, folder, contentType }) {
  const client = getClient();
  if (!client) {
    const error = new Error('R2 конфигурациясы жоқ');
    error.code = 'R2_NOT_CONFIGURED';
    throw error;
  }

  const objectKey = buildObjectKey(folder, originalName);
  const resolvedContentType = inferContentType(originalName, contentType);

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: objectKey,
    Body: buffer,
    ContentType: resolvedContentType
  });

  await client.send(command);

  return {
    provider: 'r2',
    objectKey,
    publicUrl: publicUrlFor(objectKey),
    contentType: resolvedContentType
  };
}

async function deleteObject(objectKey) {
  if (!objectKey) return;
  const client = getClient();
  if (!client) return;

  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET,
    Key: objectKey
  });

  await client.send(command);
}

async function getObjectSignedUrl(objectKey, options = {}) {
  const client = getClient();
  if (!client) {
    const error = new Error('R2 конфигурациясы жоқ');
    error.code = 'R2_NOT_CONFIGURED';
    throw error;
  }

  const expiresIn = options.expiresIn || 900;
  const responseContentDisposition = options.downloadFileName
    ? `attachment; filename="${encodeURIComponent(options.downloadFileName)}"`
    : undefined;

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: objectKey,
    ResponseContentDisposition: responseContentDisposition
  });

  return getSignedUrl(client, command, { expiresIn });
}

module.exports = {
  isR2Configured,
  uploadBuffer,
  deleteObject,
  getObjectSignedUrl,
  publicUrlFor,
  inferContentType
};
