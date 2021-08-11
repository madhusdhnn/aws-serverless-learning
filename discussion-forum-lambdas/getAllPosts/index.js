"use strict";

const AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-2"
});

const db = new AWS.DynamoDB.DocumentClient();
const table = "post";

const buildResponse = (statusCode, body) => {
  return {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  };
};

const getAllPosts = async (username) => {
  try {
    let params = {
      TableName: table
    };

    const scanResults = {
      public: [],
      private: []
    };
    let items;

    do {
      items = await db.scan(params).promise();
      if (items.Items) {
        items.Items.forEach((item) => {
          if (item.channel.type === "public") {
            scanResults.public.push(item);
          } else if (item.channel.type === "private") {
            if (item.author === username) {
              scanResults.private.push(item);
            }
          }
        });
        params.ExclusiveStartKey = items.LastEvaluatedKey;
      }
    } while (typeof items.LastEvaluatedKey != "undefined");
    return buildResponse(200, {
      operation: "READ_ALL_POSTS",
      result: "SUCCESS",
      posts: scanResults
    });
  } catch (e) {
    return buildResponse(400, {
      operation: "SAVE_CHANNEL",
      result: "FAILED",
      message: e.message
    });
  }
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
  return await getAllPosts(claims["cognito:username"]);
};
