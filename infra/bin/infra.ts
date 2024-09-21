#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { ApiStack } from '../lib/stacks/api-stack'
import { FrontendStack } from '../lib/stacks/frontend-stack'
import { StorageStack } from '../lib/stacks/storage-stack'

const app = new cdk.App()

export const env = {
  region: process.env.CDK_DEFAULT_REGION,
  account: process.env.CDK_DEFAULT_ACCOUNT
} as const;

const storageStack = new StorageStack(app, 'StorageStack', {
  env
})

const apiStack = new ApiStack(app, 'ApiStack', {
  env,
  s3BucketCredentials: storageStack.s3BucketPublic.secret
})


/*
new FrontendStack(app, 'FrontendStack', {
  env,
  apiUrl: apiStack.appRunner.runner.serviceUrl
});
 */
