import { Construct } from 'constructs';
import * as amplify from '@aws-cdk/aws-amplify-alpha';
import { SecretValue } from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import { App } from '@aws-cdk/aws-amplify-alpha';

interface AmplifyGithubConstructProps {
  owner: string;
  repository: string;
  environment: { [key: string]: string };
}

export class AmplifyGithubConstruct extends Construct {
  public amplifyApp: App;

  constructor(scope: Construct, id: string, props: AmplifyGithubConstructProps) {
    super(scope, id);

    this.amplifyApp = new amplify.App(this, 'NextjsApp', {
      platform: amplify.Platform.WEB_COMPUTE,
      environmentVariables: props.environment,
      sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
        owner: props.owner,
        repository: props.repository,
        oauthToken: SecretValue.secretsManager('github_oauth_amplify', {
          jsonField: 'GITHUB_TOKEN',
        }),
      }),
      buildSpec: codebuild.BuildSpec.fromObjectToYaml({
        version: '1.0',
        frontend: {
          phases: {
            preBuild: {
              commands: [
                'npm i -g tsx',
                'cd client',
                'yarn install',
              ],
            },
            build: {
              commands: [
                'yarn build',
                'node amplify.mjs'
              ],
            },
          },
          artifacts: {
            baseDirectory: '.next', // Output the build from the `client` folder
            files: ['**/*'],
          },
          cache: {
            paths: ['node_modules/**/*'], // Cache `node_modules` inside the `client` folder
          },
        },
      }),
      customRules: [
        {
          source: '/<*>',
          target: '/index.html',
          status: amplify.RedirectStatus.NOT_FOUND_REWRITE,
        },
      ],
    });

    this.amplifyApp.addCustomRule({
      source: '/<*>',
      target: '/index.html',
      status: amplify.RedirectStatus.REWRITE,
    });

    // add production branch
    this.amplifyApp.addBranch('main', {
      autoBuild: true,
      pullRequestPreview: true,
    });
  }
}
