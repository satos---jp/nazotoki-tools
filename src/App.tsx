import React, {useEffect, useState} from 'react';
import logo from './logo.svg';
import './App.css';

import {jsooTest} from './jsoo_wrapper';
import {butadicTest} from './butadic_wrapper';
import {solverTest} from './solver';

function App() {
  const [s,setS] = useState("");
  const [s2,setS2] = useState("");
  useEffect(() => {
    // jsooTest(setS);
    solverTest(setS2);
  },[]);

  return (
    <div>
      <div > hoge </div>
      <div> {s} </div>
      <div> { butadicTest() }</div>
      <div> { s2 }</div>
      <div> 使用ライブラリ/Alt-ergo/豚辞書第14版</div>
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
