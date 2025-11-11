import * as core from '@actions/core';
import { S3Client, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { InputOptions } from './types';

const NODE_ENV = process.env['NODE_ENV'];

const AWS_ACCESS_KEY_ID = process.env['AWS_ACCESS_KEY_ID'] || '';
const AWS_SECRET_ACCESS_KEY = process.env['AWS_SECRET_ACCESS_KEY'] || '';
const AWS_BUCKET = process.env['AWS_BUCKET'] || '';

if (!AWS_ACCESS_KEY_ID) throw new Error('AWS Access Key ID was not provided');
if (!AWS_SECRET_ACCESS_KEY) throw new Error('AWS Secret Access Keys was not provided');
if (!AWS_BUCKET) throw new Error('AWS Bucket was not provided');

let input: InputOptions;
if (NODE_ENV !== 'local') {
  input = {
    awsAccessKeyId: core.getInput('aws-access-key-id', { required: true }),
    awsSecretAccessKey: core.getInput('aws-secret-access-key', { required: true }),
    awsRegion: core.getInput('aws-region', { required: true }),
    awsBucket: core.getInput('aws-bucket', { required: true }),
    filePath: core.getInput('file-path', { required: true }),
    destinationDir: core.getInput('destination-dir'),
    bucketRoot: core.getInput('bucket-root'),
    outputFileUrl: core.getInput('output-file-url'),
    contentType: core.getInput('content-type'),
    contentDisposition: core.getInput('content-disposition'),
    public: core.getInput('public'),
    expire: core.getInput('expire'),
    alternativeDomainPublic: core.getInput('alternative-domain-public'),
    alternativeDomainPrivate: core.getInput('alternative-domain-private'),
    tags: core.getInput('tags'),
  };
} else {
  input = {
    awsAccessKeyId: AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: AWS_SECRET_ACCESS_KEY,
    awsRegion: 'ap-northeast-1',
    awsBucket: AWS_BUCKET,
    filePath: './README.md',
    destinationDir: '',
    bucketRoot: '',
    outputFileUrl: 'true',
    contentType: '',
    contentDisposition: '',
    public: 'false',
    expire: '180',
    alternativeDomainPublic: '',
    alternativeDomainPrivate: '',
    tags: ''
  };
}

const client = new S3Client({
  region: input.awsRegion,
  credentials: {
    accessKeyId: input.awsAccessKeyId,
    secretAccessKey: input.awsSecretAccessKey,
  },
});

async function run(input: InputOptions) {
  let expire;
  if (input.expire) {
    expire = parseInt(input.expire);
    if (isNaN(expire) || expire < 0 || expire > 604800) {
      throw new Error('"expire" input should be a number between 0 and 604800.');
    }
  }

  let bucketRoot = input.bucketRoot || 'artifacts/';
  if (bucketRoot.startsWith('/')) {
    bucketRoot = bucketRoot.slice(1);
  }
  if (bucketRoot && !bucketRoot.endsWith('/')) {
    bucketRoot += '/';
  }

  let destinationDir = input.destinationDir || getRandomStr(32) + '/';
  if (destinationDir.startsWith('/')) {
    destinationDir = destinationDir.slice(1);
  }
  if (destinationDir && !destinationDir.endsWith('/')) {
    destinationDir += '/';
  }

  const fileKey = bucketRoot + destinationDir + path.basename(input.filePath);
  const acl = input.public === 'true' ? 'public-read' : 'private';

  let tagging;
  if (input.tags) {
    tagging = input.tags.split(',').map(pair => {
      const [Key, Value] = pair.split('=');
      return { Key: Key.trim(), Value: (Value || '').trim() };
    });
  }

  const params: PutObjectCommandInput = {
    Bucket: input.awsBucket,
    Key: fileKey,
    ContentType: input.contentType,
    ContentDisposition: input.contentDisposition,
    Body: fs.readFileSync(input.filePath),
    ACL: acl,
    ...(tagging && { Tagging: tagging.map(t => `${t.Key}=${t.Value}`).join('&') }),
  };

  const command = new PutObjectCommand(params);
  await client.send(command);

  // Inserted: build public or signed file URL and optionally set output
  let fileUrl: string | undefined;
  if (input.outputFileUrl === 'true') {
    if (input.public === 'true') {
      fileUrl = `https://${input.awsBucket}.s3.${input.awsRegion}.amazonaws.com/${fileKey}`; 
    }

    if (input.outputFileUrl === 'true' && fileUrl) {
      core.setOutput('file-url', fileUrl);
    }
  }
}

run(input)
  .then(() => {
    core.setOutput('result', 'success');
  })
  .catch(error => {
    core.setOutput('result', 'failure');
    core.setFailed(error.message);
  });

function getRandomStr(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}