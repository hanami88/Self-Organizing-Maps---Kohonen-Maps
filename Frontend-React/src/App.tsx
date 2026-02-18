import React, { useState } from "react";
import Router from "./router/router";
import Nav from "./components/Nav";

function App() {
  return (
    <div>
      <Nav />
      <Router />
    </div>
  );
}

export default App;
