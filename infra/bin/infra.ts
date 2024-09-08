#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { ApiStack } from '../lib/stacks/api-stack'

const app = new cdk.App()

export const env = {
  region: process.env.CDK_DEFAULT_REGION,
  account: process.env.CDK_DEFAULT_ACCOUNT
} as const;

new ApiStack(app, 'ApiStack', {
  env
})
