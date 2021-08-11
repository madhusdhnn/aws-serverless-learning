import React from 'react';
import NavBar from './NavBar';
import PropTypes from 'prop-types';

const Layout = function (props) {
   return (
      <div className="container">
         <NavBar isLoading={props.isLoading} />
         {props.children}
      </div>
   );
};

Layout.propTypes = {
   isLoading: PropTypes.bool.isRequired
};

export default Layout;
