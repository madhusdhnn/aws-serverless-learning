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

const authenticateUser = (requestBody, callback) => {
  const params = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: "7flidpu02ccgj5lpmmtqv0tccm",
    AuthParameters: {
      USERNAME: requestBody.username,
      PASSWORD: requestBody.password
    }
  };

  cognito.initiateAuth(params, (err, data) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, data);
    }
  });
};

exports.handler = function (event, context, callback) {
  authenticateUser(JSON.parse(event.body), (err, data) => {
    if (err) {
      callback(
        null,
        buildResponse(401, {
          operation: "AUTHENTICATE_USER",
          result: "FAILED",
          message: err.message
        })
      );
    } else {
      callback(
        null,
        buildResponse(200, {
          operation: "AUTHENTICATE_USER",
          result: "SUCCESS",
          auth: {
            access: data.AuthenticationResult.AccessToken,
            identity: data.AuthenticationResult.IdToken,
            expiresIn: data.AuthenticationResult.ExpiresIn
          }
        })
      );
    }
  });
};
