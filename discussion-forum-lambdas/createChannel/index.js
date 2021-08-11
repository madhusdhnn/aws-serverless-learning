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

const parseChannelType = (type) => {
  const ALLOWED_TYPES = ["public", "private"];
  if (!ALLOWED_TYPES.includes(type)) {
    throw new Error(`Unsupported channel type passed - ${type}`);
  }
  return type;
};

const channelNameToId = (channelName = "") => {
  const specialCharRegex = /[&\/\\#,+()$~%.'":*?<>{}]/g;
  return channelName
    .replace(specialCharRegex, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
};

const respondWithError = (e) => {
  if (e.code === "ConditionalCheckFailedException") {
    return buildResponse(409, {
      operation: "SAVE_CHANNEL",
      result: "FAILED",
      message: "Channel already exists"
    });
  }
  return buildResponse(400, {
    operation: "SAVE_CHANNEL",
    result: "FAILED",
    message: e.message
  });
};

const createNewChannel = async (requestBody, username) => {
  const { name, type } = requestBody;
  const body = {
    name: name,
    type: parseChannelType(type),
    channelId: channelNameToId(name),
    createdAt: new Date().toUTCString()
  };

  if (type === "private") {
    body.allowedUsers = db.createSet([username]);
  }

  const params = {
    TableName: table,
    Item: body,
    ConditionExpression: "attribute_not_exists(channelId)"
  };

  try {
    await db.put(params).promise();
    const response = {
      operation: "SAVE_CHANNEL",
      result: "SUCCESS",
      item: body
    };
    return buildResponse(200, response);
  } catch (e) {
    console.error("Error", e);
    return respondWithError(e);
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
  return await createNewChannel(
    JSON.parse(event.body),
    claims["cognito:username"]
  );
};
