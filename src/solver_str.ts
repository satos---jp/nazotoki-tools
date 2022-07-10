import _ from 'lodash';
import {hiragana,data} from './butadic.buta014.dic';

function assert(b:boolean){
  if(!b){
    throw new Error('assert false');
  }
}

type logty = (..._:any[]) => void

const data_dict = _.groupBy(data,(v) => v.length);
// console.log(
//   Array.from({length:7}).map((_,i) => [i+2,data_dict[i+2].length]));
// [
//   [ 2, 2032 ],
//   [ 3, 15674 ],
//   [ 4, 42814 ],
//   [ 5, 41205 ],
//   [ 6, 40045 ],
//   [ 7, 34639 ],
//   [ 8, 24683 ]
// ]

type char = number;

export function solve_query(query: string[], log:logty) {
  let max_q = 0;
  const queries : (string|char)[][] = query.map((s,qidx) => {
    const ts = s.split('').map((c) => {
      if("1234567890".includes(c)){
        const tc = `x${c}`;
        // vars.add(tc);
        // uniques.add(tc);
        return tc;
      }
      else if(c === "?"){
        const tc = `x${10+max_q}`;
        max_q += 1;
        // vars.add(tc);
        return tc;
      }
      else return hiragana.indexOf(c);
    });
    return ts;
  });

  function isQuestion(v:number){
    return v >=10;
  }
  
  // dict[constraints[i][j]]が制約iに関するj番目の単語である
  const constraints : number[][] = [];
  // vPos[qn] は制約qnにおける変数番号 -> 位置のテーブル 
  const vPos : Map<number,number>[] = [];
  // 変数の集合
  const vars : Set<number> = new Set();
  // 制約qnにおける変数集合
  const varsQn : number[][] = [];

  queries.forEach((q,qn) => {
    const qc : [number,number][] = [];
    q.forEach((v,i) => {
      if(typeof v === "number"){
        qc.push([i,v]);
      }
    });

    const ds = data_dict[q.length];
    const nconstr : number[] = [];
    ds.forEach((s,i) => {
      let ok = true;
      for(let i = 0; i < q.length; i++){
        const v = q[i];
        if(typeof v === "number"){
          if(s[i] !== v)ok = false;
        } else {
          assert(typeof v === "string");
          for(let j = 0; j < i; j++){
            if(v === q[j]){
              if(s[i] !== s[j]){
                ok = false;
              }
            }
          }
        }
        if(!ok)break;
      }
      if(ok){
        nconstr.push(i);
        // log(qc,s,i,nconstr);
      }
    });
    // log("nconstr:",q,nconstr);
    constraints.push(nconstr);

    const nvpos = new Map();
    const nvars : Set<number> = new Set();
    q.forEach((c,ci) => {
      if(typeof c === "string"){
        const tc = Number(c.substr(1));
        assert(tc !== Number("Nan"));
        nvpos.set(tc,ci); // このとき、1単語に複数該当箇所のある場合は最後の箇所になる
        vars.add(tc);
        nvars.add(tc);
      }
    });
    vPos.push(nvpos);
    varsQn.push(Array.from(nvars));
  });
  // log('constraints:',constraints);

  const answers: [number,string][][] = [];

  // back track search
  function search(
    // nvidx:number,
    // nvidxDom:Set<char>,
    limits:number[],
    freeVars_all:number[],
    doms_all:Set<char>[],
    used: char[],
    answer:[number,string][]){

    // log(limits,answer);
    // log(doms_all);

    // XXX: とりあえず currentDomsが一番小さいものを次の探索候補にする
    const minDomSize = Math.min(...doms_all.map(s => s.size));
    const minIdx = (()=>{
      let res = -1;
      doms_all.forEach((s,i) => {
        if(s.size === minDomSize)res = i;
      })
      return res;
    })();
    const nvidx = freeVars_all[minIdx];
    const nvidxDom = doms_all[minIdx];
    const freeVars = freeVars_all.filter((_,i) => i !== minIdx);
    const doms = doms_all.filter((_,i) => i !== minIdx);

    //

    const tLimits = [...limits];
    const currentDoms: Set<char>[] = doms.map(s => new Set(s));
    //制約qnにおけるnvidxの値をcにする
    function update_constraints(qn:number,c:number){
      let res : string | undefined = "Ok";

      const vi = vPos[qn].get(nvidx);
      if(vi === undefined)return res; // 変数nvidxはqnに関わっていない
      let lidx = limits[qn];
      const dict = data_dict[queries[qn].length];

      // freeVars上の位置
      // qnにはfreeVars[fvarsIdx[...]]が含まれる。
      const fvarsIdx : number[] = 
        freeVars.map((v,i) => [v,i])
                .filter(([v,i]) => varsQn[qn].includes(v))
                .map(([_,i]) => i);
      
      // 制約qnのvPosfvars[i]番目の文字が変数freeVars[fvarsIdx[i]]に対応
      const vPosfvars : number[] = (() => {
        const res = fvarsIdx.map(v => vPos[qn].get(freeVars[v]));
        return res.filter(v => v !== undefined).map(Number);
      })();
      assert(vPosfvars.length === fvarsIdx.length);
      const tdoms : Set<char>[] = fvarsIdx.map(_ => new Set());
      for(let i = 0; i < lidx;){
        const word = dict[constraints[qn][i]];
        let isValid = true;
        if(word[vi] !== c){
          isValid = false;
        } else {
          fvarsIdx.forEach((v,i) => {
            if(!isValid)return;
            const ic = word[vPosfvars[i]];
            if(!currentDoms[fvarsIdx[i]].has(ic)){
              isValid = false;
            }
            if(used.includes(ic)){
              isValid = false;
            }
          });
        }
        if(!isValid){
          // 制約 nvidx == c に矛盾したので外す
          const tmp = constraints[qn][i];
          constraints[qn][i] = constraints[qn][lidx-1];
          constraints[qn][lidx-1] = tmp;
          lidx--;
        } else {
          // 制約は残し、domsを拡大する
          fvarsIdx.forEach((v,i) => {
            tdoms[i].add(word[vPosfvars[i]]);
          });
          i++;
        }
      }

      // log('tlidx',lidx,tdoms);
      tLimits[qn] = lidx;
      if(lidx === 0){
        // log('returining undefined',qn,lidx);
        return undefined;
      }
      // currentDomsを狭める
      fvarsIdx.forEach((vi,i) => {
        currentDoms[vi] = tdoms[i];
        if(tdoms[i].size === 0){
          // log('returining undefined tdoms',qn,i);
          res = undefined;
        }
      });
      return res;
    }

    nvidxDom.forEach(c => {
      let ok = true;
      if(used.includes(c))return;
      const tused = isQuestion(nvidx) ? used : used.concat([c]);
      doms.forEach((s,i) => {
        currentDoms[i] = s
      });
      // log(c,ok,[...currentDoms.map(s => new Set(s))]);
      queries.forEach((q,qn) => {
        if(!ok)return;
        const nok = update_constraints(qn,c);
        // console.log("nok",c,q,qn,nok);
        if(nok === undefined){
          ok = false;
        }
      });
      // log(c,ok,tLimits,[...currentDoms.map(s => new Set(s))]);
      if(ok){
        const tans = answer.concat([[nvidx,hiragana[c]]]);
        if(freeVars.length === 0){
          // log("used",used,tans);
          tans.sort(([i,_],[j,__]) => i-j);
          answers.push(tans);
        }else{
          search(
            tLimits,
            freeVars,
            currentDoms,
            tused,
            tans,
          );
        }
      }
    });
  }

  const avars = Array.from(vars);
  search(
    constraints.map(l => l.length),
    avars,
    avars.map(_ => new Set(hiragana.map((_,i) => i))),
    [],
    []
  );

  return answers;
}

export const solverStr = (
  query: string[],
  callback : (s:string) => void,
  log:logty) => {
  const start = Date.now();
  const res = solve_query(query,log);
  log(res);
  log(`time: ${(Date.now()-start)/1000}[s]`);
  const vs : string[] =
    res.map(v => v.sort().map(([i,c]) => `${i}${c}`).join('/'));
  const s : string = `hit#${res.length}\n` + vs.join('\n') + `\nEND\n`;
  callback(s);
};