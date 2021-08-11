import React, {useEffect, useState} from 'react';
import Layout from './components/layouts';
import {AppContext} from './libs/contextLib';
import {Auth} from 'aws-amplify';

function App(props) {

   const [isLoading, setLoading] = useState(true);
   const [isAuthenticated, setAuthenticated] = useState(false);

   useEffect(() => {
      onLoad();
   }, []);

   async function onLoad() {
      try {
         await Auth.currentSession();
         setAuthenticated(true);
      } catch (e) {
         setAuthenticated(false);
      }
      setLoading(false);
   }

   return (
      <AppContext.Provider value={{isAuthenticated, setAuthenticated}}>
         <Layout isLoading={isLoading}>
            {props.children}
         </Layout>
      </AppContext.Provider>
   );
}

export default App;
