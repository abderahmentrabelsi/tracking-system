import * as cdk from 'aws-cdk-lib';
import { EcrRepoWithPushAccess } from '../constructs/compute/pushable-ecr-construct';
import { AppRunnerConstruct } from '../constructs/compute/apprunner-container';
import { RdsDatabaseConstruct } from '../constructs/database/rds-database-construct';
import { Vpc } from 'aws-cdk-lib/aws-ec2';

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

    const dbCredentials = this.database.getCredentials();

    this.appRunner = new AppRunnerConstruct(this, 'AppRunnerService', {
      repository: this.ecrRepo.repository,
      vpc: this.vpc,
      environmentVariables: {
        DB_USERNAME: dbCredentials.username,
        DB_PASSWORD: dbCredentials.password,
        DB_NAME: dbCredentials.dbName,
        DB_PORT: dbCredentials.port,
      },
    });
  }
}
