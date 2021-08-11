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

const deleteChannel = async (channelId) => {
  try {
    const params = {
      TableName: table,
      Key: {
        channelId: channelId
      },
      ReturnValues: "ALL_OLD"
    };

    const resp = await db.delete(params).promise();
    return buildResponse(200, {
      operation: "DELETE_CHANNEL",
      result: "SUCCESS",
      item: { ...resp.Attributes }
    });
  } catch (e) {
    return buildResponse(400, {
      operation: "DELETE_CHANNEL",
      result: "FAILED",
      reason: JSON.stringify(e)
    });
  }
};

exports.handler = async function (event) {
  const claims = event.requestContext.authorizer.claims;
  const SUPPORTED_GROUPS = ["Admin", "Moderator"];
  if (!SUPPORTED_GROUPS.includes(claims["cognito:groups"])) {
    return buildResponse(403, {
      message:
        "You are not authorized to access the service. Please contact your administrator."
    });
  }
  return await deleteChannel(event.queryStringParameters.channelId);
};
