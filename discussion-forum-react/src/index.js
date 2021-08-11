import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import {BrowserRouter as Router} from 'react-router-dom';
import {Amplify} from 'aws-amplify';
import config from './config';
import Routes from './components/Routes';

Amplify.configure({
   Auth: {
      mandatorySignIn: true,
      region: config.cognito.REGION,
      userPoolId: config.cognito.USER_POOL_ID,
      userPoolWebClientId: config.cognito.APP_CLIENT_ID,
      authenticationFlowType: config.cognito.AUTHENTICATION_FLOW_TYPE
   },
   API: {
      endpoints: [
         {
            name: 'Online Discussion Forum API',
            endpoint: config.apiGateway.URL,
            region: config.apiGateway.REGION
         },
      ]
   }
});


ReactDOM.render(
   <Router>
      <App>
         <Routes />
      </App>
   </Router>,
   document.getElementById('root')
);

