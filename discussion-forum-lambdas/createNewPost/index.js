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

const getChannel = (channelId) => {
  const params = {
    TableName: "channel",
    Key: {
      channelId: channelId
    }
  };
  return new Promise((resolve, reject) => {
    db.get(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        if (!data.Item) {
          reject(Error(`No channel found with the id - ${channelId}`));
        }
        resolve(data.Item);
      }
    });
  });
};

const questionToId = (question = "") => {
  const specialCharRegex = /[&\/\\#,+()$~%.'":*?<>{}]/g;
  return question
    .replace(specialCharRegex, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
};

const respondWithError = (e) => {
  if (e.code === "ConditionalCheckFailedException") {
    return buildResponse(409, {
      operation: "SAVE_POST",
      result: "FAILED",
      message: "Question already posted"
    });
  }
  return buildResponse(400, {
    operation: "SAVE_POST",
    result: "FAILED",
    message: e.message
  });
};

const createNewQuestion = async (requestBody, username) => {
  const { question } = requestBody;
  return getChannel(requestBody.channelId)
    .then((resp) => {
      const { channelId, type, allowedUsers } = resp;

      if (
        type === "private" &&
        (!allowedUsers || !allowedUsers.has(username))
      ) {
        return buildResponse(403, {
          operation: "SAVE_POST",
          result: "FAILED",
          message:
            "User does not have access to post the question in the channel. Contact administrator."
        });
      }

      const body = {
        postId: channelId + ":" + questionToId(question),
        author: username,
        channel: {
          channelId,
          type
        },
        question,
        replies: [],
        shortDesc: requestBody.hasOwnProperty("shortDesc")
          ? requestBody.shortDesc
          : "",
        upVotes: [],
        downVotes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const params = {
        TableName: table,
        Item: body,
        ConditionExpression: "attribute_not_exists(postId)"
      };

      return db
        .put(params)
        .promise()
        .then(
          (d) =>
            buildResponse(200, {
              operation: "SAVE_POST",
              result: "SUCCESS",
              post: body
            }),
          (e) => respondWithError(e)
        );
    })
    .catch((err) => respondWithError(err));
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

  return await createNewQuestion(
    JSON.parse(event.body),
    claims["cognito:username"]
  );
};
