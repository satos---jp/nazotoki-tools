(async () => {
  const z3Module = await import('z3-solver/build/node-wrapper.js');
  const init = z3Module.init;
  let { em, Z3 } = await init();
  // let { init } = require('z3-solver');
  // // @ts-ignore
  // let { Z3 } = await init();
})();

export {}