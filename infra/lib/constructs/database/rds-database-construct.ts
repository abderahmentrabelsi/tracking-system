import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { SecureDatabase, DatabaseCredentials } from '../../utils/database-credentials';

export interface RdsDatabaseProps extends cdk.StackProps {
  databaseName: string;
  instanceIdentifier: string;
  username: string;
  vpc: ec2.IVpc;
  instanceSize?: ec2.InstanceType;
}

export class RdsDatabaseConstruct extends Construct implements SecureDatabase<DatabaseCredentials> {
  public readonly dbInstance: rds.DatabaseInstance;
  public readonly secret: secretsmanager.ISecret; // Make the secret publicly accessible
  private readonly dbName: string;
  private readonly dbUsername: string;
  private readonly dbPort: string;

  constructor(scope: Construct, id: string, props: RdsDatabaseProps) {
    super(scope, id);

    this.dbName = props.databaseName;
    this.dbUsername = props.username;

    // Create or retrieve the secret in AWS Secrets Manager
    this.secret = new secretsmanager.Secret(this, 'DBSecret', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: props.username }),
        generateStringKey: 'password',
        excludeCharacters: '/@" |_\'',  // Exclude specific characters that MySQL rejects
        passwordLength: 16,
      },
    });

    // Create the RDS instance using the secret
    this.dbInstance = new rds.DatabaseInstance(this, 'RdsInstance', {
      engine: rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_8_0_39,
      }),
      vpc: props.vpc,
      instanceType: props.instanceSize || ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      multiAz: false,
      allocatedStorage: 20,
      maxAllocatedStorage: 20,
      storageType: rds.StorageType.GP2,
      publiclyAccessible: true, // Make the RDS instance publicly accessible
      credentials: rds.Credentials.fromSecret(this.secret), // Use the generated secret
      databaseName: this.dbName,
      deletionProtection: false,
      backupRetention: cdk.Duration.days(1),
      autoMinorVersionUpgrade: true,
    });

    // Allow connections from any IP on port 3306
    this.dbInstance.connections.allowFromAnyIpv4(ec2.Port.tcp(3306));

    // Store RDS endpoint, port, and database name in SSM Parameter Store
    new ssm.StringParameter(this, 'RdsEndpoint', {
      parameterName: `/app/env/DB_HOST`,
      stringValue: this.dbInstance.instanceEndpoint.hostname,
    });

    this.dbPort = this.dbInstance.instanceEndpoint.port.toString();

    new ssm.StringParameter(this, 'RdsPort', {
      parameterName: `/app/env/DB_PORT`,
      stringValue: this.dbPort,
    });

    new ssm.StringParameter(this, 'RdsDatabaseName', {
      parameterName: `/app/env/DB_DATABASE`,
      stringValue: this.dbName,
    });

    // Output the RDS information
    new cdk.CfnOutput(this, 'DBEndpoint', {
      value: this.dbInstance.instanceEndpoint.hostname,
      exportName: `${props.instanceIdentifier}-Endpoint`,
    });

    new cdk.CfnOutput(this, 'DBPort', {
      value: this.dbInstance.instanceEndpoint.port.toString(),
      exportName: `${props.instanceIdentifier}-Port`,
    });

    new cdk.CfnOutput(this, 'DBSecretArn', {
      value: this.secret.secretArn,
      exportName: `${props.instanceIdentifier}-SecretArn`,
    });
  }

  // Implement the getCredentials method from the SecureDatabase interface
  public getCredentials(): DatabaseCredentials {
    return {
      username: this.dbUsername,
      password: this.secret.secretValueFromJson('password').toString(), // Fetch the password from Secrets Manager
      dbName: this.dbName,
      port: this.dbPort,
    };
  }
}
