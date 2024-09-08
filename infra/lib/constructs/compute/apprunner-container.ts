import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apprunner from '@aws-cdk/aws-apprunner-alpha';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export interface AppRunnerConstructProps extends cdk.StackProps {
  repository: ecr.IRepository;
  port: number;
  imageTag?: string;
  vpc: ec2.IVpc;
  environmentVariables?: { [key: string]: string };
}

export class AppRunnerConstruct extends Construct {
  constructor(scope: Construct, id: string, props: AppRunnerConstructProps) {
    super(scope, id);

    const imageTag = props.imageTag ?? 'latest';

    const vpcConnector = new apprunner.VpcConnector(this, 'AppRunnerVpcConnector', {
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    });

    new apprunner.Service(this, 'AppRunnerService', {
      source: apprunner.Source.fromEcr({
        repository: props.repository,
        tagOrDigest: imageTag,
        imageConfiguration: {
          port: props.port,
          environmentVariables: props.environmentVariables, // Use environment variables from SSM
        },
      }),
      autoDeploymentsEnabled: true,
      vpcConnector: vpcConnector,
    });

    new cdk.CfnOutput(this, 'AppRunnerServiceUrl', {
      value: `Service running with image ${props.repository.repositoryUri}:${imageTag}`,
    });
  }
}
