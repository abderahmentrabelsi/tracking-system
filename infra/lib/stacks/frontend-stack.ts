import * as cdk from 'aws-cdk-lib'
import { AmplifyGithubConstruct } from '../constructs/frontend/amplify-github-construct'
import * as ssm from 'aws-cdk-lib/aws-ssm'

export interface FrontendStackProps extends cdk.StackProps {
}

export class FrontendStack extends cdk.Stack {
  public amplifyFrontend: AmplifyGithubConstruct

  constructor(scope: cdk.App, id: string, props?: FrontendStackProps) {
    super(scope, id, props)

    const jwtParameter = ssm.StringParameter.fromSecureStringParameterAttributes(this, 'JwtSecretParameter', {
      parameterName: '/app/env/JWT_SECRET',
      version: 1
    })

    this.amplifyFrontend = new AmplifyGithubConstruct(this, 'AmplifyFrontend', {
      owner: 'abderahmentrabelsi',
      repository: 'tracking-system',
      environment: {
        JWT_SECRET_KEY: 'PNC9o42M5zrzdfgrm0nQQUAY4AmothvY', // todo: amplify doesn't support ssm parameters, move to secrets manager
        NEXT_PUBLIC_MEASUREMENT_ID: 'G-0Z6D87DQ2N'
      }
    })

    new cdk.CfnOutput(this, 'AmplifyAppUrl', {
      value: this.amplifyFrontend.amplifyApp?.defaultDomain
    })
  }
}