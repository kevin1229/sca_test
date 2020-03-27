import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Login from "./container/Login"

function App() {
  return (
    <Router>
      <div>
        <Route exact path="/login" component={Login} />
      </div>
    </Router>
  )
}

export default App;