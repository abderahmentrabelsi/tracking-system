import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_s3 as s3, aws_iam as iam, aws_secretsmanager as secretsmanager, CfnOutput } from 'aws-cdk-lib';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

export interface S3BucketPublicProps extends cdk.StackProps {
  bucketName: string;
}

export class S3BucketPublic extends Construct {
  public secret: Secret

  constructor(scope: Construct, id: string, props: S3BucketPublicProps) {
    super(scope, id);

    // Create S3 bucket with public access
    const bucket = new s3.Bucket(this, 'PublicS3Bucket', {
      bucketName: props.bucketName,
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
    });

    // Create IAM user
    const user = new iam.User(this, 'S3BucketUser', {
      userName: `${props.bucketName}-user`,
    });

    // Attach policy to the user to manage the bucket
    bucket.grantReadWrite(user);

    // Create access keys for the user
    const accessKey = new iam.CfnAccessKey(this, 'S3BucketUserAccessKey', {
      userName: user.userName,
    });

    // Create a secret in Secrets Manager to store the AccessKeyId, SecretAccessKey, and BucketUrl
    this.secret = new secretsmanager.Secret(this, 'S3BucketSecret', {
      secretName: `${props.bucketName}-credentials`,
      description: 'Access keys and bucket URL for S3 bucket management',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          AccessKeyId: accessKey.ref,
          SecretAccessKey: accessKey.attrSecretAccessKey,
          BucketUrl: bucket.bucketWebsiteUrl,
          BucketName: bucket.bucketName,
        }),
        generateStringKey: 'generatedField', // This is just a placeholder and will be ignored
      },
    });

    // Output the access key ID, secret access key, bucket URL, and secret ARN
    new CfnOutput(this, 'AccessKeyId', {
      value: accessKey.ref,
    });

    new CfnOutput(this, 'SecretAccessKey', {
      value: accessKey.attrSecretAccessKey,
    });

    new CfnOutput(this, 'BucketUrl', {
      value: bucket.bucketWebsiteUrl,
    });

    new CfnOutput(this, 'SecretArn', {
      value: this.secret.secretArn,
    });
  }
}
