import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { DatabaseCredentials, SecureDatabase } from '../../utils/database-credentials';

export interface RdsDatabaseProps extends cdk.StackProps {
  databaseName: string;
  instanceIdentifier: string;
  username: string;
  passwordParameterName: string; // This is the SSM parameter name for the password
  vpc: ec2.Vpc;
}

export class RdsDatabaseConstruct extends Construct implements SecureDatabase<DatabaseCredentials> {
  public readonly dbInstance: rds.DatabaseInstance;
  private readonly dbName: string;

  constructor(scope: Construct, id: string, props: RdsDatabaseProps) {
    super(scope, id);

    this.dbName = props.databaseName;

    // Create RDS Instance
    this.dbInstance = new rds.DatabaseInstance(this, 'RdsInstance', {
      engine: rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_8_0_39,
      }),
      vpc: props.vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      multiAz: false, // Free tier does not support Multi-AZ
      allocatedStorage: 20, // Minimum storage for free tier
      maxAllocatedStorage: 100,
      storageType: rds.StorageType.GP2,
      publiclyAccessible: true, // Can be false if private access is needed
      credentials: rds.Credentials.fromGeneratedSecret(props.username, {
        secretName: props.passwordParameterName, // Store in SSM Parameter Store
      }),
      databaseName: this.dbName,
      deletionProtection: false, // Disable deletion protection for easier cleanup in the free tier
      backupRetention: cdk.Duration.days(7), // Backup retention period
      autoMinorVersionUpgrade: true, // Keep DB up to date with minor versions
    });

    // Store RDS Endpoint and Port in SSM Parameter Store
    new ssm.StringParameter(this, 'RdsEndpoint', {
      parameterName: `/rds/${props.instanceIdentifier}/endpoint`,
      stringValue: this.dbInstance.instanceEndpoint.hostname,
    });

    new ssm.StringParameter(this, 'RdsPort', {
      parameterName: `/rds/${props.instanceIdentifier}/port`,
      stringValue: this.dbInstance.instanceEndpoint.port.toString(),
    });

    new ssm.StringParameter(this, 'RdsDatabaseName', {
      parameterName: `/rds/${props.instanceIdentifier}/database-name`,
      stringValue: this.dbName,
    });

    new cdk.CfnOutput(this, 'DBEndpoint', {
      value: this.dbInstance.instanceEndpoint.hostname,
      exportName: `${props.instanceIdentifier}-Endpoint`,
    });

    new cdk.CfnOutput(this, 'DBPort', {
      value: this.dbInstance.instanceEndpoint.port.toString(),
      exportName: `${props.instanceIdentifier}-Port`,
    });
  }

  getCredentials(): DatabaseCredentials {
    const username = ssm.StringParameter.valueForStringParameter(this, `/rds/${this.dbInstance.instanceIdentifier}/username`);
    const password = ssm.StringParameter.valueForStringParameter(this, `/rds/${this.dbInstance.instanceIdentifier}/password`);
    const dbName = ssm.StringParameter.valueForStringParameter(this, `/rds/${this.dbInstance.instanceIdentifier}/database-name`);
    const port = ssm.StringParameter.valueForStringParameter(this, `/rds/${this.dbInstance.instanceIdentifier}/port`);

    return {
      username,
      password,
      dbName,
      port,
    };
  }
}
