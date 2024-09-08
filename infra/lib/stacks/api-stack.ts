import * as cdk from 'aws-cdk-lib';
import { EcrRepoWithPushAccess } from '../constructs/compute/pushable-ecr-construct'
import { AppRunnerConstruct } from '../constructs/compute/apprunner-container'

export class ApiStack extends cdk.Stack {
  private ecrRepo: EcrRepoWithPushAccess;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.ecrRepo = new EcrRepoWithPushAccess(this, 'EcrRepoWithPushAccess', {
      region: this.region,
      repositoryName: 'qore-tracking-api',
    });

    new AppRunnerConstruct(this, 'AppRunnerService', {
      repository: this.ecrRepo.repository,
    });
  }
}


