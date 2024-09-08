import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { SecureDatabase, DatabaseCredentials, generateRandomPassword } from '../../utils/database-credentials'
import { SecureStringParameter, ValueType } from 'cdk-secure-string-parameter';

export interface RdsDatabaseProps extends cdk.StackProps {
  databaseName: string;
  instanceIdentifier: string;
  username: string;
  vpc: ec2.Vpc;
  instanceSize?: ec2.InstanceType;
}

export class RdsDatabaseConstruct extends Construct implements SecureDatabase<DatabaseCredentials> {
  public readonly dbInstance: rds.DatabaseInstance;
  private readonly dbName: string;
  private readonly dbUsername: string;
  private readonly dbPassword: string;
  private readonly dbPort: string;

  constructor(scope: Construct, id: string, props: RdsDatabaseProps) {
    super(scope, id);

    this.dbName = props.databaseName;
    this.dbUsername = props.username;

    // Generate a random password securely
    const generatedPassword = cdk.SecretValue.unsafePlainText(generateRandomPassword(16));
    this.dbPassword = generatedPassword.unsafeUnwrap();

    // Create the password parameter in SSM
    const passwordParam = new SecureStringParameter(this, 'RdsPasswordParameter', {
      parameterName: '/app/env/DB_PASSWORD',
      stringValue: this.dbPassword,
      valueType: ValueType.PLAINTEXT,
    });


    // Ensure RDS instance depends on the SSM parameter being created
    this.dbInstance = new rds.DatabaseInstance(this, 'RdsInstance', {
      engine: rds.DatabaseInstanceEngine.mysql({
        version: rds.MysqlEngineVersion.VER_8_0_39,
      }),
      vpc: props.vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      multiAz: false,
      allocatedStorage: 20,
      maxAllocatedStorage: 20,
      storageType: rds.StorageType.GP2,
      publiclyAccessible: true, // Make the RDS instance publicly accessible
      credentials: rds.Credentials.fromPassword(
        props.username,
        cdk.SecretValue.ssmSecure(passwordParam.parameterName)
      ),
      databaseName: this.dbName,
      deletionProtection: false,
      backupRetention: cdk.Duration.days(1),
      autoMinorVersionUpgrade: true,
    });

    this.dbInstance.connections.allowFromAnyIpv4(ec2.Port.tcp(3306)); // Allow connections from any IP address
    this.dbInstance.node.addDependency(passwordParam);

    // Store RDS Endpoint, Port, and Database Name in SSM Parameter Store
    const rdsEndpointParam = new ssm.StringParameter(this, 'RdsEndpoint', {
      parameterName: `/app/env/DB_HOST`,
      stringValue: this.dbInstance.instanceEndpoint.hostname,
    });

    this.dbPort = this.dbInstance.instanceEndpoint.port.toString();

    const rdsPortParam = new ssm.StringParameter(this, 'RdsPort', {
      parameterName: `/app/env/DB_PORT`,
      stringValue: this.dbPort,
    });

    const rdsDbNameParam = new ssm.StringParameter(this, 'RdsDatabaseName', {
      parameterName: `/app/env/DB_DATABASE`,
      stringValue: this.dbName,
    });

    // Ensure SSM parameters depend on the DB instance being created
    rdsEndpointParam.node.addDependency(this.dbInstance);
    rdsPortParam.node.addDependency(this.dbInstance);
    rdsDbNameParam.node.addDependency(this.dbInstance);

    // Output the RDS information and password
    new cdk.CfnOutput(this, 'DBEndpoint', {
      value: this.dbInstance.instanceEndpoint.hostname,
      exportName: `${props.instanceIdentifier}-Endpoint`,
    }).node.addDependency(this.dbInstance);

    new cdk.CfnOutput(this, 'DBPort', {
      value: this.dbInstance.instanceEndpoint.port.toString(),
      exportName: `${props.instanceIdentifier}-Port`,
    }).node.addDependency(this.dbInstance);

    new cdk.CfnOutput(this, 'DBPasswordOutput', {
      value: passwordParam.stringValue,
      exportName: `${props.instanceIdentifier}-Password`,
    }).node.addDependency(passwordParam);
  }

  // Implement the getCredentials method from the SecureDatabase interface
  public getCredentials(): DatabaseCredentials {
    return {
      username: this.dbUsername,
      password: this.dbPassword,
      dbName: this.dbName,
      port: this.dbPort,
    };
  }
}
