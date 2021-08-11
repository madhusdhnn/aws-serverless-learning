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

const ROLES = {
  user: "User",
  admin: "Admin",
  moderator: "Moderator"
};

const assingToGroup = (username, group, callback) => {
  const params = {
    UserPoolId: "us-east-2_tMy9SYqLg",
    Username: username,
    GroupName: group
  };

  cognito.adminAddUserToGroup(params, (err, data) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, data);
    }
  });
};

const signupUser = (requestBody, callback) => {
  const { username, password, email, phone, role } = requestBody;

  const params = {
    ClientId: "7flidpu02ccgj5lpmmtqv0tccm",
    Username: username,
    Password: password,
    UserAttributes: [
      {
        Name: "email",
        Value: email
      },
      {
        Name: "phone_number",
        Value: phone
      }
    ]
  };

  cognito.signUp(params, (err, data) => {
    if (err) {
      callback(err, null);
    } else {
      assingToGroup(username, ROLES[role], callback);
    }
  });
};

exports.handler = function (event, context, callback) {
  signupUser(JSON.parse(event.body), function (err, res) {
    if (err) {
      callback(
        null,
        buildResponse(400, {
          operation: "SIGNUP_USER",
          result: "FAILED",
          message: err.message
        })
      );
    } else {
      callback(
        null,
        buildResponse(201, {
          operation: "SIGNUP_USER",
          result: "SUCCESS",
          message: "User registered successfully"
        })
      );
    }
  });
};
