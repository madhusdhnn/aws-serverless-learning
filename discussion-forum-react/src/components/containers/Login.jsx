import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import { Alert, Button } from 'react-bootstrap';
import { Auth } from 'aws-amplify';
import { useHistory } from 'react-router-dom';
import { useAppContext } from '../../libs/contextLib';

export default function Login(props) {
   const { isAuthenticated, setAuthenticated } = useAppContext();

   const history = useHistory();

   const [username, setUsername] = useState('');
   const [password, setPassword] = useState('');

   const [validated, setValidated] = useState(false);
   const [error, setError] = useState({ username: false, password: false });

   const [awsError, setAwsError] = useState(false);

   async function onSubmit(event) {
      event.preventDefault();
      try {
         let errors;
         if (username.length <= 0) {
            errors.username = true;
         }

         if (password.length <= 0) {
            errors.password = true;
         }

         setError({ ...errors });

         await Auth.signIn(username, password);
         setAuthenticated(true);
         history.push('/');
      } catch (e) {
         setAuthenticated(false);
         setAwsError(true);
      }
      setValidated(true);
   }

   function changeUsername(e) {
      setUsername(e.target.value);
   }

   function changePassword(e) {
      setPassword(e.target.value);
   }

   function resetAwsErrror() {
      setAwsError(false);
   }

   if (isAuthenticated) {
      return (
         <>
            {props.children}
         </>
      );
   }
   return (
      <div className="Auth">
         <Form noValidate validated={validated} onSubmit={onSubmit}>
            <Form.Group size="lg" controlId="username">
               <Form.Label>Username</Form.Label>
               <Form.Control
                  required
                  type="text"
                  value={username}
                  autoComplete="off"
                  isInvalid={error.username}
                  onChange={changeUsername}
               />
               <Form.Control.Feedback type="invalid">
                  Please enter your username.
               </Form.Control.Feedback>
            </Form.Group>
            <Form.Group size="lg" controlId="password">
               <Form.Label>Password</Form.Label>
               <Form.Control
                  required
                  type="password"
                  value={password}
                  autoComplete="off"
                  isInvalid={error.password}
                  onChange={changePassword}
               />
               <Form.Control.Feedback type="invalid">
                  Please enter your password.
               </Form.Control.Feedback>
            </Form.Group>
            <Alert show={awsError} variant="danger" dismissible onClose={resetAwsErrror}>
               <p>Error while authentication. Please try again!</p>
            </Alert>
            <Button block size="lg" type="submit">
               Login
            </Button>
         </Form>
      </div>
   );
};
