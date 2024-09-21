import * as cdk from 'aws-cdk-lib'
import { S3BucketPublic } from '../constructs/storage/s3-bucket-public'

export interface StorageStackProps extends cdk.StackProps {
}

export class StorageStack extends cdk.Stack {
  public s3BucketPublic: S3BucketPublic
  constructor(scope: cdk.App, id: string, props?: StorageStackProps) {
    super(scope, id, props)

    this.s3BucketPublic = new S3BucketPublic(this, 'S3BucketPublic', {
      bucketName: 'qore-tracking-public'
    })
    }
}