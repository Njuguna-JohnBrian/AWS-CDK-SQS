import { APIGatewayProxyResultV2, SQSEvent } from "aws-lambda";

export async function main(event: SQSEvent): Promise<APIGatewayProxyResultV2> {
  const messages = event.Records.map((record) => {
    const body = JSON.parse(record.body) as {
      Subject: string;
      Message: string;
    };
    return { subject: body.Subject, message: body.Message };
  });
  let result = JSON.parse(JSON.stringify(messages, null, 2));
  console.log("Stack Webhook 👉", result);
  return {
    body: JSON.stringify({ messages }),
    statusCode: 200,
  };

  //   throw new Error("throwing an Error 💥");
}
