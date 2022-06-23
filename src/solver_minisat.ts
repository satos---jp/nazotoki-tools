import {hiragana,data} from './butadic.buta014.dic';
const worker = new Worker('./minisat/minisat_withWorker.js');

function assert(b:boolean){
  if(!b){
    throw new Error('assert false');
  }
}

type logty = (..._:any[]) => void

function convert_to_query(query: string[], log:logty)
  : {cnf_head: string,
     cnf_tail: string,relation:Map<number,string>} {
  // const cs = Array.from({length: hiragana.length}, (_,i) => `c${i}`);
  let max_q = 0;
  const vars : Set<string> = new Set();
  const uniques : Set<string> = new Set();
  
  const queries_ = query.map((s,qidx) => {
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

    // s_i_j :: i個目の単語はjを選ぶ
    // x_i_j :: 文字iはj文字目のひらがなを選ぶ
    let match_idx = 0;
    const l = ts.length;
    const match = (() => {
      const tsc : (string|number)[] = ts.map((c) => {
        if(c[0] === 'x')return c;
        return hiragana.indexOf(c);
      });

      return ((d:number[]) : string[][] | undefined => {
        if(d.length !== l)return undefined;
        let res : string[][] = [];
        let ok = true;
        tsc.forEach((c,i) => {
          if(!ok)return;
          if(typeof c === "string"){
            // qidxの候補としてmatch_idx番目の単語を選んだなら、
            // この文字(c)は文字d[i]を選ぶ
            res.push([`-s_${qidx}_${match_idx}`,`${c}_${d[i]}`]);
          } else {
            if(c !== d[i])ok = false;
          }
        })
        if(ok){
          match_idx += 1;
          return res;
        }
        return undefined;
      });
    })();

    const res : string[][] = [];
    log('start ForEach in query');
    data.forEach((s) => {
      const tm = match(s);
      if(tm === undefined)return;
      // res = res.concat(tm);
      // res = tm.concat(res);
      tm.forEach(v => res.push(v));
    });
    log('finish ForEach query');

    // 1つ以上の単語を選ぶ
    res.push(Array.from({length:match_idx}, (_,i) => `s_${qidx}_${i}`));
    return res;
  });
  log('finish converting query according to words');
  const queries = queries_.flat();
  log('finish flatten');

  // 各文字に対応するひらがなは1つ
  const char_is_unique : string[][] = Array.from(vars).map((v) => {
    const res : string[][] = [];
    for(let i = 0; i < hiragana.length; i++){
      for(let j = 0; j < i; j++){
        res.push([`-${v}_${i}`,`-${v}_${j}`]);
      }
    }
    return res;
  }).flat();

  // 数字は特に違う文字に割り振る
  const uniqueq : string[][] = (() => {
    const res : string[][] = [];
    const us = Array.from(uniques);
    for(let k = 0; k < hiragana.length; k++){
      for(let i = 0; i < us.length; i++){
        for(let j = 0; j < i; j++){
          res.push([`-${us[i]}_${k}`,`-${us[j]}_${k}`]);
        }
      }
    }
    return res;
  })();

  log('finish pushing res');

  let res = "";
  let varidx = 1;
  let var2num : Map<string,number> = new Map();
  const cmap : Map<number,string> = new Map();
  const tqs = queries.concat(char_is_unique).concat(uniqueq);
  tqs.forEach((q) => {
    q.forEach((v) => {
      const b = v[0] === '-' ? v.substr(1) : v;
      if(!(var2num.has(b))){
        var2num.set(b,varidx);
        if(b[0] === "x"){
          cmap.set(varidx,b);
        }
        varidx += 1;
      }
      const tb = var2num.get(b);
      res += `${v[0] === "-" ? "-" : ""}${tb} `;
    });
    res += "0\n";
  });
  const cnf_head = `p cnf ${varidx-1} ${tqs.length}\n`;
  const cnf_tail = res;

  const relation = cmap;
  return {cnf_head, cnf_tail,relation};
}

function recover(result:string,relation:Map<number,string>, log:logty) {
  const s = (()=>{
    const s = result.split(' ');
    log(s);
    if(s[0] === "UNSAT")return undefined;
    assert(s[0] === "SAT");
    s.shift();
    return new Set(s.map((s) => Number(s)).filter((v) => v > 0));
  })();
  if(s === undefined){
    return "UNSAT";
  }
  const res : [string,string,number][]= [];
  log(s);
  relation.forEach((v,k) => {
    //console.log(k,v);
    if(s.has(k)){
      assert(v[0] === "x");
      const [v1,v2] = v.substr(1).split('_');
      const c = hiragana[Number(v2)];
      res.push([v1,c,k]);
    }
  });
  return {
    str: res.sort()
            .map(([c1,c2,_]) => `${c1}${c2}`).join('/'),
    data: res
  };
}

function restrict_cnf(
  data:{cnf_head:string,cnf_tail:string, relation:Map<number,string>},
  result: {data: [string,string,number][]}
){
  const t_head = (() => { // `p cnf ${varidx-1} ${tqs.length}\n`
    const d = data.cnf_head.split(' ');
    const dl = d.pop();
    const n = Number(dl);
    
    return d.join(' ') + ` ${n+1}\n`;
  })();
  const t_tail = data.cnf_tail + (
    result.data.map(([_,__,v]) => `${-v}`).join(' ') + " 0\n"
  );

  return [t_head,t_tail];
}

export function solverMinisat(
  query: string[],
  callback : (s:string) => void,
  log:logty) : void{
  const n = Date.now();
  log("start conversion");
  const input = convert_to_query(query,log);
  log(`end conversion. Took ${(Date.now() - n) / 1000}[s]`);
  log("start solving");

  // const input = 'p cnf 3 2\n1 -3 0\n2 3 -1 0';
  let stt = 0;
  const send = (input:{cnf_head:string,cnf_tail:string}) => {
    log('sending to Worker',input);
    stt = Date.now();
    worker.postMessage(input.cnf_head + input.cnf_tail);
  };

  let cnt = 0;
  const models : string[] = [];
  worker.onmessage = function(e){
    log('recieve from worker',e,e.data);
    const s : {status: string, result: string | undefined} = e.data;
    if(s.status !== "ok"){
      cnt += 1;
      if(cnt>5)return;
      (async () =>{
        const delay = (ms:number) => new Promise(resolve => setTimeout(resolve, ms));
        await delay(1000);
        send(input);
        // stateSet(s.model.join(''));
      })();
      return;
    }
    log('received worker results',s.result?.length,s.result?.substr(0,100));
    log(`end solving. Took ${(Date.now() - stt) / 1000}[s]`);

    if(s.result){
      const ts = recover(s.result,input.relation,log);
      if(ts === "UNSAT"){
        if(models.length === 0){
          models.push("UNSAT");
          callback(models.join('\n'));
        }else{
          const f = "FINISH";
          if(!models.includes(f)){
            models.push(f);
            callback(models.join('\n'));
          }
        }
      }else{
        if(!models.includes(ts.str)){
          models.push(ts.str);
          callback(models.join('\n'));
          [input.cnf_head,input.cnf_tail] = restrict_cnf(input,ts);
          send(input);
        }
      }
    }else{
      console.error("result not found.");
    }
  }

  log("posting Msg");
  send(input);
}

export function solverTest(setState:(s:string) => void,log:logty){
  solverMinisat([
    "123えび",  "123よい"
    // "123"
    // "1234"
    // "1234", "5234" // 27[s] to gen, 1.63[s] to solve in C 
    // "1234", "5234", "5634","5674","5678" // 74.555[s] to gen, 4.46222[s] to solve
    // ,"1234", "5234", "5634","5674","5678" // 74.555[s] to gen, 4.46222[s] to solve
  ],setState,log);
}