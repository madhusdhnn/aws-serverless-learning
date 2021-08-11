"use strict";

const AWS = require("aws-sdk");
const cognito = new AWS.CognitoIdentityServiceProvider();

const buildResponse = (statusCode, body) => {
  return {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  };
};

const standardAttrs = [
  "address",
  "birthdate",
  "email",
  "family_name",
  "gender",
  "given_name",
  "locale",
  "middle_name",
  "name",
  "nickname",
  "phone_number",
  "picture",
  "preferred_username",
  "profile",
  "updated_at",
  "website",
  "zoneinfo"
];

const updateUserAttributes = async (requestBody, username) => {
  const userAttrs = requestBody.userAttributes;
  let userAttributesToUpdate = [];

  for (let attr of Object.keys(userAttrs)) {
    if (!standardAttrs.includes(attr)) {
      return buildResponse(400, {
        operation: "UPDATE_USER_ATTRIBUTES",
        result: "FAILED",
        message:
          "Unsupported attributes passed. Contact your administrator. If it is a custom attribute, prepend 'custom:' before the field."
      });
    }
    userAttributesToUpdate.push({ Name: attr, Value: userAttrs[attr] });
  }

  const params = {
    UserAttributes: userAttributesToUpdate,
    UserPoolId: "us-east-2_tMy9SYqLg",
    Username: username
  };

  try {
    await cognito.adminUpdateUserAttributes(params).promise();
    return buildResponse(200, {
      operation: "UPDATE_USER_ATTRIBUTES",
      result: "SUCCESS",
      message: "Updated successfully"
    });
  } catch (e) {
    console.log(e);
    return buildResponse(400, {
      operation: "UPDATE_USER_ATTRIBUTES",
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
  return await updateUserAttributes(
    JSON.parse(event.body),
    claims["cognito:username"]
  );
};
