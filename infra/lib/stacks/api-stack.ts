import * as cdk from 'aws-cdk-lib'
import { EcrRepoWithPushAccess } from '../constructs/compute/pushable-ecr-construct'
import { AppRunnerConstruct } from '../constructs/compute/apprunner-container'
import { RdsDatabaseConstruct } from '../constructs/database/rds-database-construct'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { IVpc } from 'aws-cdk-lib/aws-ec2'
import * as ssm from 'aws-cdk-lib/aws-ssm'
import { Secret } from '@aws-cdk/aws-apprunner-alpha'

export interface ApiStackProps extends cdk.StackProps {
  vpc?: IVpc;
}

export class ApiStack extends cdk.Stack {
  public ecrRepo: EcrRepoWithPushAccess
  public appRunner: AppRunnerConstruct
  public database: RdsDatabaseConstruct
  public vpc: IVpc

  constructor(scope: cdk.App, id: string, props?: ApiStackProps) {
    super(scope, id, props)

    this.ecrRepo = new EcrRepoWithPushAccess(this, 'EcrRepoWithPushAccess', {
      region: this.region,
      repositoryName: 'qore-tracking-api'
    })

    this.vpc = props?.vpc || ec2.Vpc.fromLookup(this, 'VPC', {
      isDefault: true
    })

    const securityGroup = new ec2.SecurityGroup(this, 'ApiSecurityGroup', {
      vpc: this.vpc,
      allowAllOutbound: true // Allow egress everywhere
    })

    // Allow all ingress (e.g., within the VPC or specific CIDR block)
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.allTraffic(), 'Allow all ingress traffic')


      this.database = new RdsDatabaseConstruct(this, 'ApiRdsDatabase', {
        databaseName: 'QoreTrackingApiDb',
        instanceSize: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
        instanceIdentifier: 'qore-tracking-api-db',
        username: 'admin',
        vpc: this.vpc
      })


      const dbSecret = this.database.secret

      const port = ssm.StringParameter.fromStringParameterAttributes(this, 'PortParameter', {
        parameterName: '/app/env/PORT',
        version: 1
      })

      const jwtParameter = ssm.StringParameter.fromSecureStringParameterAttributes(this, 'JwtSecretParameter', {
        parameterName: '/app/env/JWT_SECRET',
        version: 1
      })

      const ipInfoTokenParameter = ssm.StringParameter.fromSecureStringParameterAttributes(this, 'IpInfoTokenParameter', {
        parameterName: '/app/env/IPINFO_TOKEN',
        version: 1
      })
      console.log(`Port value: ${port}`)

      this.appRunner = new AppRunnerConstruct(this, 'AppRunnerService', {
        repository: this.ecrRepo.repository,
        vpc: this.vpc,
        port: 8383, // todo: fix me to use the port from the parameter store
        securityGroup: securityGroup,
        environmentVariables: {
          APP_ENV: ssm.StringParameter.valueForStringParameter(this, '/app/env/APP_ENV'),
          PORT: ssm.StringParameter.valueForStringParameter(this, '/app/env/PORT'),
          UPLOAD_PATH: ssm.StringParameter.valueForStringParameter(this, '/app/env/UPLOAD_PATH'),
          MEASUREMENT_ID: ssm.StringParameter.valueForStringParameter(this, '/app/env/MEASUREMENT_ID'),
          PROPERTY_ID: ssm.StringParameter.valueForStringParameter(this, '/app/env/PROPERTY_ID')
        },
        environmentSecrets: {
          DB_HOST: Secret.fromSecretsManager(dbSecret, 'host'),
          DB_USERNAME: Secret.fromSecretsManager(dbSecret, 'username'),
          DB_PASSWORD: Secret.fromSecretsManager(dbSecret, 'password'),
          DB_DATABASE: Secret.fromSecretsManager(dbSecret, 'dbname'),
          DB_PORT: Secret.fromSecretsManager(dbSecret, 'port'),
          JWT_SECRET: Secret.fromSsmParameter(jwtParameter),
          IPINFO_TOKEN: Secret.fromSsmParameter(ipInfoTokenParameter)
        }
      })

      this.appRunner.node.addDependency(this.database)

      new cdk.CfnOutput(this, 'AppRunnerServiceUrl', {
        value: this.appRunner.runner.serviceUrl,
        exportName: 'AppRunnerServiceUrl'
      })
  }
}
