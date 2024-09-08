import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apprunner from '@aws-cdk/aws-apprunner-alpha';
import * as ecr from 'aws-cdk-lib/aws-ecr';

export interface AppRunnerConstructProps extends cdk.StackProps {
  repository: ecr.IRepository;
  imageTag?: string;
}

export class AppRunnerConstruct extends Construct {
  constructor(scope: Construct, id: string, props: AppRunnerConstructProps) {
    super(scope, id);

    const imageTag = props.imageTag ?? 'latest';

    // Create AppRunner service
    new apprunner.Service(this, 'AppRunnerService', {
      source: apprunner.Source.fromEcr({
        repository: props.repository,
        tagOrDigest: imageTag,
      }),
      autoDeploymentsEnabled: true,
    });

    // Output the service URL
    new cdk.CfnOutput(this, 'AppRunnerServiceUrl', {
      value: `Service running with image ${props.repository.repositoryUri}:${imageTag}`,
    });
  }
}
