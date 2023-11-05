# AWS CDK SQS FIFO  Project

This is an AWS Cloud Development Kit (CDK) project for creating a serverless application that uses Amazon Simple Queue Service (SQS), Amazon Simple Notification Service (SNS), AWS Lambda, and Amazon API Gateway to handle incoming messages and publish them to an SNS topic.

## Project Structure

The project contains a TypeScript class `SqsFifoStack` that extends `cdk.Stack`. This class defines the infrastructure and resources for the application, including the following components:

1. **SNS Topic**: An SNS topic is created with the name "SNS" to which messages will be published.

2. **IAM Role**: An IAM role named "executionRole" is created for the AWS API Gateway. It is granted permissions to publish messages to the SNS topic.

3. **API Gateway**: An AWS API Gateway named "apigateway" is defined to serve as the RESTful API endpoint for posting messages to the SNS topic.

4. **Lambda Function**: A Node.js AWS Lambda function named "stackLambda" is created. This Lambda function is responsible for processing messages from an SQS queue.

5. **SQS Queue**: An SQS FIFO queue named "stackQueue" is created, which serves as the source of messages for the Lambda function.

## Prerequisites

Before deploying this CDK project, ensure that you have the AWS CDK installed and configured on your local machine. You can install it using npm:

```bash
npm install -g aws-cdk
```

## Deployment

To deploy this CDK project, follow these steps:

1. Clone the project repository.
2. Open a terminal and navigate to the project directory.
3. Install the project dependencies:

   ```bash
   npm install
   ```

4. Build the CDK project:

   ```bash
   npm run build
   ```

5. Deploy the CDK stack to your AWS environment:

   ```bash
   cdk deploy
   ```

## Usage

After deploying the CDK stack, you can use the API Gateway endpoint to post messages to the SNS topic. The endpoint will return a JSON response indicating the status of the operation.

To post a message, make a POST request to the API Gateway endpoint. The body of the request should contain the message content. For example:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"message": "Hello, World!"}' YOUR_API_ENDPOINT
```

## Cleanup

To remove the resources created by this CDK stack, run the following command:

```bash
cdk destroy
```

## Additional Information

For more information about AWS CDK, refer to the [AWS CDK documentation](https://docs.aws.amazon.com/cdk/latest/guide/home.html).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.