import React, {useEffect, useState} from 'react';
import logo from './logo.svg';
import './App.css';

import {jsooTest} from './jsoo_wrapper';
import {butadicTest} from './butadic_wrapper';
// import {solverTest} from './solver_ae';
import {solverTest,solverMinisat} from './solver_minisat';

function App() {
  const [s,setS] = useState("");
  const [s2,setS2] = useState("");
  const [query,setQuery] = useState("123えび\n123よい");
  const handleQuery = (event:{target:{value:string}}) => {
    setQuery(event.target.value);
  };
  const [queryResult,setQueryResult] = useState("");
  const [logs,setLogs] = useState("413");
  const log = (...args:any[]) => {
    console.log(...args);
    setLogs((l) => l + "\n" +
      String(args.map((v) => JSON.stringify(v))).substr(0,100));
  };
  const execQuery = () => {
    setQueryResult("Solving");
    solverMinisat(query.split('\n').filter((s) => s.length>0),setQueryResult,log);
  };

  useEffect(() => {
    // jsooTest(setS);
    solverTest(setS2,log);
  },[]);

  return (
    <div>
      <textarea
             value={query.split(',')}
             onChange={handleQuery}
             style={{width:"100vw",height:"50vh",fontSize:"40px"}}/>
      <button onClick={execQuery}
              style={{width:"100vw",height:"5rem",fontSize:"40px"}}> Solve </button>
      <div style={{fontSize:"40px"}}> {queryResult}</div>
      {/* <div> {s} </div> */}
      {/* <div> { butadicTest() }</div> */}
      {/* <div> { s2 }</div> */}
      <div> 使用ライブラリ/Alt-ergo/MiniSat/Emscripten/豚辞書第14版</div>
      <textarea
        value={"log:\n" + logs}
        onChange={() => {}}
        style={{width:"100vw",height:"5rem"}}/>
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
