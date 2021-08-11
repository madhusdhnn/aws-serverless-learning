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

const commentToId = (comment = "") => {
  const specialCharRegex = /[&\/\\#,+()$~%.'":*?<>{}]/g;
  return comment
    .replace(specialCharRegex, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
};

const createNewReply = async (requestBody, username) => {
  const { postId, comment } = requestBody;
  const reply = {
    replyId: `${username}:${postId}:${commentToId(comment)}`,
    authorId: username,
    comment: comment,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    upVotes: [],
    downVotes: []
  };

  const params = {
    TableName: table,
    Key: {
      postId: postId
    },
    UpdateExpression:
      "SET replies = list_append(if_not_exists(replies, :empty_list), :replies)",
    ExpressionAttributeValues: {
      ":replies": [reply],
      ":empty_list": []
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

exports.handler = async function (event) {
  const claims = event.requestContext.authorizer.claims;
  const SUPPORTED_GROUPS = ["Admin", "Moderator", "User"];
  if (!SUPPORTED_GROUPS.includes(claims["cognito:groups"])) {
    return buildResponse(403, {
      message:
        "You are not authorized to access the service. Please contact your administrator."
    });
  }
  return await createNewReply(
    JSON.parse(event.body),
    claims["cognito:username"]
  );
};
