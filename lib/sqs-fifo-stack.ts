import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as sns from "aws-cdk-lib/aws-sns";
import * as iam from "aws-cdk-lib/aws-iam";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as subscriptions from "aws-cdk-lib/aws-sns-subscriptions";

import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

export class SqsFifoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const stackTopic = new sns.Topic(this, "SNS");

    const executionRole = new iam.Role(this, "executionRole", {
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
      inlinePolicies: {
        PublishMessagePolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ["sns:Publish"],
              resources: [stackTopic.topicArn],
            }),
          ],
        }),
      },
    });

    const stackGateway = new apigateway.RestApi(this, "apigateway");

    stackGateway.root.addMethod(
      "POST",
      new apigateway.AwsIntegration({
        service: "sns",
        integrationHttpMethod: "POST",
        path: `${cdk.Aws.ACCOUNT_ID}/${stackTopic.topicArn}`,
        options: {
          credentialsRole: executionRole,
          passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
          requestParameters: {
            "integration.request.header.Content-Type": `'application/x-www-form-urlencoded'`,
          },
          requestTemplates: {
            "application/json": `Action=Publish&TopicArn=$util.urlEncode('${stackTopic.topicArn}')&Message=$util.urlEncode($input.body)`,
          },
          integrationResponses: [
            {
              statusCode: "200",
              responseTemplates: {
                "application/json": `{"status": "message added to topic"}`,
              },
            },
            {
              statusCode: "400",
              selectionPattern: "^[Error].*",
              responseTemplates: {
                "application/json": `{\"state\":\"error\",\"message\":\"$util.escapeJavaScript($input.path('$.errorMessage'))\"}`,
              },
            },
          ],
        },
      }),
      { methodResponses: [{ statusCode: "200" }, { statusCode: "400" }] }
    );

    const stackQueue = new sqs.Queue(this, "stackQueue", {
      visibilityTimeout: cdk.Duration.seconds(1),
    });

    const stackLambda = new NodejsFunction(this, "stackLambda", {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "main",
      entry: path.join(__dirname, "/../src/handler.ts"),
      timeout: cdk.Duration.seconds(1),
    });

    stackLambda.addEventSource(
      new SqsEventSource(stackQueue, {
        batchSize: 1,
      })
    );

    stackTopic.addSubscription(new subscriptions.SqsSubscription(stackQueue));
  }
}
