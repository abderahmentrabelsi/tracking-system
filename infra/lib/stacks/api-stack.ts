import * as cdk from 'aws-cdk-lib';
import { EcrRepoWithPushAccess } from '../constructs/compute/pushable-ecr-construct';
import { AppRunnerConstruct } from '../constructs/compute/apprunner-container';
import { RdsDatabaseConstruct } from '../constructs/database/rds-database-construct';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export interface ApiStackProps extends cdk.StackProps {
  vpc?: Vpc;
}

export class ApiStack extends cdk.Stack {
  public ecrRepo: EcrRepoWithPushAccess;
  public appRunner: AppRunnerConstruct;
  public database: RdsDatabaseConstruct;
  public vpc: Vpc;

  constructor(scope: cdk.App, id: string, props?: ApiStackProps) {
    super(scope, id, props);

    this.vpc = props?.vpc || new Vpc(this, 'ApiVpc', {
      maxAzs: 2,
    });

    this.ecrRepo = new EcrRepoWithPushAccess(this, 'EcrRepoWithPushAccess', {
      region: this.region,
      repositoryName: 'qore-tracking-api',
    });

    this.database = new RdsDatabaseConstruct(this, 'ApiRdsDatabase', {
      databaseName: 'qore-tracking-api-db',
      instanceIdentifier: 'qore-tracking-api-db',
      username: 'admin',
      passwordParameterName: '/rds/qore-tracking-api-db/admin-password',
      vpc: this.vpc,
    });

    // Get reconciled database credentials from SSM
    const dbCredentials = this.database.getCredentials();

    const port = ssm.StringParameter.valueForStringParameter(this, '/app/env/PORT');

    this.appRunner = new AppRunnerConstruct(this, 'AppRunnerService', {
      repository: this.ecrRepo.repository,
      vpc: this.vpc,
      port: parseInt(port),
      environmentVariables: {
        DB_USERNAME: dbCredentials.username,
        DB_PASSWORD: dbCredentials.password,
        DB_NAME: dbCredentials.dbName,
        DB_PORT: dbCredentials.port,
        APP_ENV: ssm.StringParameter.valueForStringParameter(this, '/app/env/APP_ENV'),
        PORT: port,
        JWT_SECRET: ssm.StringParameter.valueForStringParameter(this, '/app/env/JWT_SECRET'),
        IPINFO_TOKEN: ssm.StringParameter.valueForStringParameter(this, '/app/env/IPINFO_TOKEN'),
        UPLOAD_PATH: ssm.StringParameter.valueForStringParameter(this, '/app/env/UPLOAD_PATH'),
        MEASUREMENT_ID: ssm.StringParameter.valueForStringParameter(this, '/app/env/MEASUREMENT_ID'),
        PROPERTY_ID: ssm.StringParameter.valueForStringParameter(this, '/app/env/PROPERTY_ID'),
      },
    });
  }
}
