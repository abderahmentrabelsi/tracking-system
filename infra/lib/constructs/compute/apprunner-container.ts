import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apprunner from '@aws-cdk/aws-apprunner-alpha';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Secret, Service } from '@aws-cdk/aws-apprunner-alpha'
import { SecretValue } from 'aws-cdk-lib'

export interface AppRunnerConstructProps extends cdk.StackProps {
  repository: ecr.IRepository;
  port: number;
  imageTag?: string;
  vpc: ec2.IVpc;
  environmentVariables?: { [key: string]: string};
  environmentSecrets?: { [key: string]: Secret  };
  securityGroup: ec2.SecurityGroup;
}

export class AppRunnerConstruct extends Construct {
  public runner: Service
  constructor(scope: Construct, id: string, props: AppRunnerConstructProps) {
    super(scope, id);

    const imageTag = props.imageTag ?? 'latest';

    const vpcConnector = new apprunner.VpcConnector(this, 'AppRunnerVpcConnector', {
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      securityGroups: [props.securityGroup],
    });

    this.runner = new apprunner.Service(this, 'AppRunnerService', {
      source: apprunner.Source.fromEcr({
        repository: props.repository,
        tagOrDigest: imageTag,
        imageConfiguration: {
          port: props.port,
          environmentVariables: props.environmentVariables,
          environmentSecrets: props.environmentSecrets
        },
      }),
      autoDeploymentsEnabled: true,
      vpcConnector: vpcConnector,
    });

    new cdk.CfnOutput(this, 'AppRunnerServiceUrl', {
      value: `Service running with image ${props.repository.repositoryUri}:${imageTag}`,
    });

    new cdk.CfnOutput(this, 'AppRunnerServiceEndpoint', {
      value: `Service running at ${this.runner.serviceUrl}`,
    });

  }
}
