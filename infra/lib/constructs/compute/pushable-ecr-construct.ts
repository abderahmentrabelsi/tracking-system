import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export interface EcrRepoWithPushAccessProps extends cdk.StackProps {
  repositoryName?: string;
  userName?: string;
  parameterPrefix?: string;
  region: string;
}

export class EcrRepoWithPushAccess extends Construct {
  public readonly repository: ecr.Repository;
  public readonly pushUser: iam.User; 

  constructor(scope: Construct, id: string, props: EcrRepoWithPushAccessProps) {
    super(scope, id);

    const repoName = props.repositoryName ?? 'ecr-repo';
    const userName = props.userName ?? 'ecr-push-user';
    const parameterPrefix = props.parameterPrefix ?? '/ecr';

    // Create a private ECR repository
    this.repository = new ecr.Repository(this, 'EcrRepo', {
      repositoryName: repoName,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create an IAM user with permissions to push images to the repository
    this.pushUser = new iam.User(this, 'EcrPushUser', {
      userName: userName,
    });

    this.repository.grantPush(this.pushUser);

    // Create access keys for the IAM user
    const accessKey = new iam.CfnAccessKey(this, 'PushUserAccessKey', {
      userName: this.pushUser.userName,
    });

    // Store credentials and repo details in Parameter Store with optional prefix
    new ssm.StringParameter(this, 'AccessKeyParam', {
      parameterName: `${parameterPrefix}/push-user/access-key-id`,
      stringValue: accessKey.ref,
    });

    new ssm.StringParameter(this, 'SecretKeyParam', {
      parameterName: `${parameterPrefix}/push-user/secret-access-key`,
      stringValue: accessKey.attrSecretAccessKey,
    });

    new ssm.StringParameter(this, 'RepoUriParam', {
      parameterName: `${parameterPrefix}/repo/uri`,
      stringValue: this.repository.repositoryUri,
    });

    new ssm.StringParameter(this, 'RepoNameParam', {
      parameterName: `${parameterPrefix}/repo/name`,
      stringValue: this.repository.repositoryName,
    });

    new ssm.StringParameter(this, 'RegionParam', {
      parameterName: `${parameterPrefix}/repo/region`,
      stringValue: props.region,
    });

    // Output the required information
    new cdk.CfnOutput(this, 'AccessKeyOutput', {
      value: accessKey.ref,
      exportName: 'PushUserAccessKey',
    });

    new cdk.CfnOutput(this, 'SecretAccessKeyOutput', {
      value: accessKey.attrSecretAccessKey,
      exportName: 'PushUserSecretAccessKey',
    });

    new cdk.CfnOutput(this, 'RepoUriOutput', {
      value: this.repository.repositoryUri,
      exportName: 'RepoUri',
    });

    new cdk.CfnOutput(this, 'RepoNameOutput', {
      value: this.repository.repositoryName,
      exportName: 'RepoName',
    });

    new cdk.CfnOutput(this, 'RegionOutput', {
      value: props.region,
      exportName: 'Region',
    });
  }
}
