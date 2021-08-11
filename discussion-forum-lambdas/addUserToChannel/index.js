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

const addUserToPrivateChannel = async (channelId, username) => {
  const params = {
    TableName: table,
    Key: {
      channelId: channelId
    },
    UpdateExpression: "SET allowedUsers = :allowedUsers",
    ExpressionAttributeValues: {
      ":allowedUsers": db.createSet([username])
    },
    ReturnValues: "ALL_NEW"
  };
  try {
    const resp = await db.update(params).promise();
    console.log(resp);
    return buildResponse(200, {
      operation: "CREATE_COMMENT",
      result: "SUCCESS",
      message: "Added Sucessfully"
    });
  } catch (e) {
    return buildResponse(500, {
      operation: "CREATE_COMMENT",
      result: "FAILED",
      message: e.message
    });
  }
};

const sameCaseEquals = (str1, str2) => {
  if (!str1) {
    return false;
  }

  if (!str2) {
    return false;
  }

  const str1Lower = str1.toLowerCase();
  const str2Lower = str2.toLowerCase();

  return str1Lower === str2Lower;
};

exports.handler = async function (event) {
  const claims = event.requestContext.authorizer.claims;
  if (!sameCaseEquals(claims["cognito:groups"], "admin")) {
    return buildResponse(403, {
      message:
        "You are not authorized to access the service. Please contact your administrator."
    });
  }
  return await addUserToPrivateChannel(
    event.pathParameters.channelId,
    claims["cognito:username"]
  );
};
