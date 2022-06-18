import {hiragana, data} from './butadic_wrapper';
import {worker} from './jsoo_wrapper';

function binary_join(ss: string[],sep:string){
  let nss = ss;
  while(nss.length > 1){
    const tmp = [];
    for(let i = 0; i < nss.length; i+=2){
      if(i+1 < nss.length){
        tmp.push(`(${nss[i] + sep + nss[i+1]})`);
      }
      else{
        tmp.push(nss[i]);
      }
    }
    nss = tmp;
  }
  return nss[0];
}

function convert_to_query(query: string[]){
  const cs = Array.from({length: hiragana.length}, (_,i) => `c${i}`);
  let max_q = 0;
  const vars : Set<string> = new Set();
  const uniques : Set<string> = new Set();
  const queries = query.map((s) => {
    const ts = s.split('').map((c) => {
      if("1234567890".includes(c)){
        const tc = `x${c}`;
        vars.add(tc);
        uniques.add(tc);
        return tc;
      }
      else if(c === "?"){
        const tc = `x${10+max_q}`;
        max_q += 1;
        vars.add(tc);
        return tc;
      }
      else return c;
    });
    const l = ts.length;
    const match = (d:number[]) => {
      if(d.length !== l)return undefined;
      let res : string[] = [];
      let ok = true;
      ts.forEach((c,i) => {
        if(!ok)return;
        if(c[0] === 'x'){
          res.push(`${c} = c${d[i]}`);
        } else {
          if(hiragana.indexOf(c) !== d[i])ok = false;
        }
      })
      if(ok)return res;
      return undefined;
    };

    const res = ["false"];
    data.forEach((s) => {
      const tm = match(s);
      if(tm === undefined)return;
      const ttm = tm.join(' and ');
      res.push(`(${ttm})`);
    })
    return '(' + binary_join(res,' or ') + ')';
  });
  const declare = Array.from(vars).join(',');
  const uniqueq = (() => {
    const res = [];
    const us = Array.from(uniques);
    for(let i = 0; i < us.length; i++){
      for(let j = 0; j < i; j++){
        res.push(`(${us[i]} <> ${us[j]})`);
      }
    }
    return res;
  })();
  //このandを二分木的につなぐことでparse時のStack Overflowを回避できる
  return [
    "type h = " + cs.join(' | '),
    `logic ${declare}: h`,
    `goal g: not (${(queries.concat(uniqueq)).join(' and ')})`
  ];
}

function solverTest(stateSet : (s:string) => void){
  const qs = convert_to_query(["123えび","123よい"]);
  // const qs = convert_to_query(["1234","5234","5634","5674","5678"]);
  // const qs = convert_to_query(["1234","5234"]);
  // const qs = convert_to_query(["1234"]);
  // const debugs = (
  //   [15,50,15,50].map((i) => hiragana[i]).join('/') + 
  //   qs[1] + '/' + 
  //   qs[2].substring(0,100) + qs.join('&')
  // );
  const debugs = (
    [64,43,14,35,5].map((i) => hiragana[i]).join('/')
  );
  console.log('lendebugs',debugs.length);
  console.log(qs.join('&'));
  
  let start_t = Date.now();
  worker.onmessage = function(e){
    const s : {model: string[]}= JSON.parse(e.data);
    console.log('received worker results',s);
    stateSet(`time: ${(Date.now() - start_t)/1000}[s]` + debugs + '###' + s.model.join(''));
  }

  const tqs = "a".repeat(7680);

  worker.postMessage([0,
    // JSON.stringify({content: [ "goal g : false" ] }),
    // JSON.stringify({content: [tqs] }),
    // opts]);
    "@@" + qs.join("#"), 
    JSON.stringify({
      // debug: true,
      file: "try-alt-ergo-file.ae",
      sat_solver: "Tableaux",
      input_format: "Native",
      // verbose: true,
      model: "all",
    })]);
}
export {solverTest}