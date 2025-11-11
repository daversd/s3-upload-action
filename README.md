# s3-upload-action/s3-upload-action/README.md

# S3 Upload Action

This GitHub Action allows you to upload files to an AWS S3 bucket, generate signed URLs, and create QR codes for easy access to the uploaded files.

## Features

- Upload files to S3 with configurable options.
- Generate signed URLs for private files.
- Create QR codes for public file URLs.

## Inputs

The action accepts the following inputs:

- `aws-access-key-id`: Your AWS access key ID (required).
- `aws-secret-access-key`: Your AWS secret access key (required).
- `aws-region`: The AWS region where your S3 bucket is located (required).
- `aws-bucket`: The name of the S3 bucket (required).
- `file-path`: The path to the file you want to upload (required).
- `destination-dir`: The destination directory in the S3 bucket (optional).
- `bucket-root`: The root directory in the S3 bucket (optional).
- `output-file-url`: Whether to output the file URL (default: true).
- `content-type`: The content type of the file (optional).
- `content-disposition`: The content disposition of the file (optional).
- `output-qr-url`: Whether to output the QR code URL (default: true).
- `qr-width`: The width of the generated QR code (default: 120).
- `public`: Whether the uploaded file should be public (default: false).
- `expire`: The expiration time for signed URLs in seconds (default: 180).
- `alternative-domain-public`: An alternative domain for public files (optional).
- `alternative-domain-private`: An alternative domain for private files (optional).
- `tags`: Comma-separated tags for the uploaded file (optional).

## Outputs

The action will output the following:

- `file-url`: The URL of the uploaded file.
- `qr-url`: The URL of the generated QR code.

## Usage

Here is an example of how to use this action in your workflow:

```yaml
name: Upload to S3

on:
  push:
    branches:
      - main

jobs:
  upload:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Upload file to S3
        uses: ./s3-upload-action
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
          aws-bucket: my-bucket
          file-path: ./path/to/file.txt
          destination-dir: uploads/
```

## License

This project is licensed under the MIT License. See the LICENSE file for more details.