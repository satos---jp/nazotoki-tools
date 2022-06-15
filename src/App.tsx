import React, {useEffect, useState} from 'react';
import logo from './logo.svg';
import './App.css';

import {jsooTest} from './jsoo_wrapper';

function App() {
  const [s,setS] = useState("");
  useEffect(() => {
    jsooTest(setS);
  },[]);

  return (
    <div>
      <div > hoge </div>
      <div> {s} </div>
    </div>
    // <div className="App">
    //   <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <p>
    //       Edit <code>src/App.tsx</code> and save to reload.
    //     </p>
    //     <a
    //       className="App-link"
    //       href="https://reactjs.org"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn React
    //     </a>
    //   </header>
    // </div>
  );
}

export default App;
