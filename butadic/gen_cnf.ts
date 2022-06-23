import {hiragana,data} from './butadic.buta014.dic';
const fs = require('fs');

function convert_to_query(query: string[]) : {cnf:string, relation:string} {
  // const cs = Array.from({length: hiragana.length}, (_,i) => `c${i}`);
  let max_q = 0;
  const vars : Set<string> = new Set();
  const uniques : Set<string> = new Set();
  
  const queries = query.map((s,qidx) => {
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
    const match = (d:number[]) : string[][] | undefined => {
      if(d.length !== l)return undefined;
      let res : string[][] = [];
      let ok = true;
      ts.forEach((c,i) => {
        if(!ok)return;
        if(c[0] === 'x'){
          // qidxの候補としてmatch_idx番目の単語を選んだなら、
          // この文字(c)は文字d[i]を選ぶ
          res.push([`-s_${qidx}_${match_idx}`,`${c}_${d[i]}`]);
        } else {
          if(hiragana.indexOf(c) !== d[i])ok = false;
        }
      })
      if(ok){
        match_idx += 1;
        return res;
      }
      return undefined;
    };

    let res : string[][] = [];
    data.forEach((s) => {
      const tm = match(s);
      if(tm === undefined)return;
      res = res.concat(tm);
    });

    // 1つ以上の単語を選ぶ
    res.push(Array.from({length:match_idx}, (_,i) => `s_${qidx}_${i}`));
    return res;
  }).flat();

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

  let res = "";
  let varidx = 1;
  let var2num : Map<string,number> = new Map();
  const cmapstr : string[] = [];
  const tqs = queries.concat(char_is_unique).concat(uniqueq);
  tqs.forEach((q) => {
    q.forEach((v) => {
      const b = v[0] === '-' ? v.substr(1) : v;
      if(!(var2num.has(b))){
        var2num.set(b,varidx);
        if(b[0] === "x"){
          cmapstr.push(`${varidx}: "${b}", `);
        }
        varidx += 1;
      }
      const tb = var2num.get(b);
      res += `${v[0] === "-" ? "-" : ""}${tb} `;
    });
    res += "0\n";
  });
  res = `p cnf ${varidx-1} ${tqs.length}\n` + res;

  const relation = (
    `hiragana=[${hiragana.map((c) => `"${c}"`).join(',')}]\n` +
    `cmap={${cmapstr.join("")}}`
  );
  return {cnf: res,relation};
}

const n = Date.now();
console.log("start conversion");
const s = convert_to_query([
  // "123えび",  "123よい"
  // "1234", "5234" // 27[s] to gen, 1.63[s] to solve in C 
  "1234", "5234", "5634","5674","5678" // 74.555[s] to gen, 4.46222[s] to solve
]);
console.log(`end conversion. Took ${(Date.now() - n) / 1000}[s]`);

fs.writeFile("tes.cnf",s.cnf,(err:any) => {
  if(err){
    console.log("write error",err);
  }else{
    console.log("write succeeded");
  }
});

// python向けの対応表を作る
fs.writeFile("tes_rel.py",s.relation,(err:any) => {
  if(err){
    console.log("write error",err);
  }else{
    console.log("write succeeded");
  }
});