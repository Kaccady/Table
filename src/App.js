import React from 'react';
import Table from './table';
import { BrowserRouter as Router, Route,Redirect,Switch } from "react-router-dom";

function App() {
  return (
    <div className="App"><Router>
      <Switch>      
      <Route path='/table' component={Table}/>
      <Redirect from="/"push to="/table" />
      </Switch>
     </Router>
    </div>
  );
}

export default App;
