import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import Home from './containers/Home';
import Login from './containers/Login';
import SignUp from './containers/SignUp';

function Routes() {
   return (
      <Switch>
         <Route exact path="/login" component={Login} />
         <Route exact path="/signup" component={SignUp} />
         <Route exact path="/posts/home" component={Home} />
         <Redirect from="/posts" exact to="/posts/home" />
         <Redirect from="/" exact to="/posts/home" />
         <Redirect from="*" exact to="/posts/home" />
      </Switch>
   );
}

export default Routes;
