export interface InputOptions {
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
  awsRegion: string;
  awsBucket: string;
  filePath: string;
  destinationDir?: string;
  bucketRoot?: string;
  outputFileUrl?: string;
  contentType?: string;
  contentDisposition?: string;
  public?: string;
  expire?: string;
  alternativeDomainPublic?: string;
  alternativeDomainPrivate?: string;
  tags?: string;
}
