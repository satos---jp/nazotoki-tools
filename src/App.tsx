import React from 'react';
import { useEffect,useState } from 'react';
import logo from './logo.svg';
import './App.css';
// import './coi-serviceworker';

// import {initZ3} from 'z3-solver';
import {init} from 'z3-solver';
import type {
  Z3_config,
  Z3_context,
  Z3_solver,
  Z3_sort,
  Z3_ast,
  Z3_app,
  Z3_model,
  Z3_symbol,
  Z3_ast_vector,
  Z3_func_decl,
  Z3_func_interp,
  Z3_func_entry,
} from 'z3-solver';

import wasm from './z3-built.wasm';

function App() {
  useEffect(() => {
    // const _ = require('./coi-serviceworker.js');
    const __ = require('./z3_wrapper.ts');
    // (async() => {
    //   // let { init } = require('z3-solver/build/wrapper.js');
    //   let { em, Z3 } = await init();
    //   function mk_context(): Z3_context {
    //     let cfg: Z3_config = Z3.mk_config();
    //     Z3.set_param_value(cfg, 'model', 'true');
    //     let ctx: Z3_context = Z3.mk_context(cfg);
    //     Z3.del_config(cfg);
    //     return ctx;
    //   }
    //   let ctx: Z3_context = mk_context();
    //   console.log('inited Z3',ctx);
    // })();
  });
  return (
    <div> test </div>
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
