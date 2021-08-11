"use strict";

const AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-2"
});

const db = new AWS.DynamoDB.DocumentClient();
const table = "channel";

const buildResponse = (statusCode, body) => {
  return {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  };
};

const getChannelById = (channelId) => {
  const params = {
    TableName: table,
    Key: {
      channelId: channelId
    }
  };
  return db
    .get(params)
    .promise()
    .then(
      (resp) =>
        buildResponse(200, {
          operation: "READ_CHANNEL",
          result: "SUCESS",
          item: resp.Item
        }),
      (err) =>
        buildResponse(400, {
          operation: "READ_CHANNEL",
          result: "FAILED",
          reason: JSON.stringify(err)
        })
    );
};

exports.handler = async function (event) {
  const claims = event.requestContext.authorizer.claims;
  const SUPPORTED_GROUPS = ["Admin", "Moderator", "User"];
  if (!SUPPORTED_GROUPS.includes(claims["cognito:groups"])) {
    return buildResponse(403, {
      message:
        "You are not authorized to access the service. Please contact your administrator."
    });
  }
  return getChannelById(event.queryStringParameters.channelId);
};
