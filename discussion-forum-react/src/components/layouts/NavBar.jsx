import React from 'react';
import {Nav, Navbar} from 'react-bootstrap';
import {LinkContainer} from 'react-router-bootstrap';
import {useAppContext} from '../../libs/contextLib';
import {useHistory} from 'react-router-dom';
import {Auth} from 'aws-amplify';
import PropTypes from 'prop-types';

const NavBar = function (props) {
   const history = useHistory();
   const {isAuthenticated, setAuthenticated} = useAppContext();

   async function logoutUser() {
      await Auth.signOut();
      setAuthenticated(false);
      history.push('/login');
   }

   function protectedNavMenus() {
      return (
         <Navbar.Collapse className="justify-content-end">
            <Nav activeKey={window.location.pathname}>
               <Nav.Link onClick={logoutUser}>Sign out</Nav.Link>
            </Nav>
         </Navbar.Collapse>
      );
   }

   function publicNavMenus() {
      return (
         <Navbar.Collapse className="justify-content-end">
            <Nav activeKey={window.location.pathname}>
               <LinkContainer to="/signup">
                  <Nav.Link>Signup</Nav.Link>
               </LinkContainer>
               <LinkContainer to="/login">
                  <Nav.Link>Login</Nav.Link>
               </LinkContainer>
            </Nav>
         </Navbar.Collapse>
      );
   }

   return (
      !props.isLoading && (
         <div className="container py-3">
            <Navbar collapseOnSelect bg="light" expand="md" className="mb-3">
               <LinkContainer to="/">
                  <Navbar.Brand className="font-weight-bold text-muted">
                     Stage
                  </Navbar.Brand>
               </LinkContainer>
               <Navbar.Toggle />
               {isAuthenticated
                  ? protectedNavMenus()
                  : publicNavMenus()
               }
            </Navbar>
         </div>
      )
   );
};

NavBar.propTypes = {
   isLoading: PropTypes.bool.isRequired
};

export default NavBar;
