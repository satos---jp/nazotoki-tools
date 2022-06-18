const worker = new Worker('./alt-ergo/alt-ergo-worker.js');

const opts = '{ \"debug\": false, \"debug_ac\": false, \"debug_adt\": false \
\"debug_arith\": false, \"debug_arrays\": false, \"debug_bitv\": false \
\"debug_cc\": false, \"debug_combine\": false, \"debug_constr\": false \
\"debug_explanations\": false, \"debug_fm\": false, \"debug_gc\": false \
\"debug_interpretation\": false, \"debug_ite\": false, \"debug_matching\": 0 \
\"debug_sat\": false, \"debug_split\": false, \"debug_sum\": false \
\"debug_triggers\": false, \"debug_types\": false, \"debug_typing\": false \
\"debug_uf\": false, \"debug_unsat_core\": false, \"debug_use\": false \
\"debug_warnings\": false, \"rule\": -1 \
\"case_split_policy\": \"AfterTheoryAssume\", \"enable_adts_cs\": false \
\"max_split\": 1000000, \"input_format\": \"Native\", \"age_bound\": 50 \
\"fm_cross_limit\": 10000, \"steps_bound\": -1, \"interpretation\": 0 \
\"output_format\": \"Native\", \"unsat_core\": true, \"verbose\": false \
\"instantiation_heuristic\": \"INormal\", \"instanciate_after_backjump\": false \
\"max_multi_triggers_size\": 4, \"nb_triggers\": 2, \"no_ematching\": false \
\"no_user_triggers\": false, \"normalize_instances\": false \
\"triggers_var\": false, \"arith_matchin\": false, \"bottom_classes\": false \
\"cdcl_tableaux_inst\": false, \"cdcl_tableaux_th\": false \
\"disable_flat_formulas_simplifiaction\": false, \"enable_restarts\": false \
\"minimal_bj\": false, \"no_backjumping\": false, \"no_backward\": false \
\"no_decisions\": false, \"no_sat_learning\": false, \"sat_solver\": \"Tableaux\" \
\"disable_ites\": false, \"inline_lets\": false, \"rewriting\": false, \
\"disable_adts\": false, \"no_ac\": false, \"no_contracongru\": false, \
\"no_fm\": false, \"no_nla\": false, \"no_tcp\": false, \"no_theory\": false, \
\"restricted\": false, \"tighten_vars\": false, \"file\": \"try-alt-ergo-file\" }';

const input = [
  "type t = v1 | v2",
  "logic x: t",
  "goal g: not (x = v1 or x = v2)",
];

export function jsooTest(stateSet : (s:string) => void){
  worker.onmessage = function(e){
    const s : {model: string[]}= JSON.parse(e.data);
    console.log('received worker results',s);
    stateSet(s.model.join(''));
  }

  worker.postMessage([0,
    // JSON.stringify({content: [ "goal g : false" ] }),
    JSON.stringify({content: input }),
    // opts]);
    JSON.stringify({
      // debug: true,
      file: "try-alt-ergo-file.ae",
      sat_solver: "Tableaux",
      input_format: "Native",
      // verbose: true,
      model: "all",
    })]);
  return `jsooTest:`;
}

export { worker };

/*
Do I better to write OCaml...?

Expr
"{ \"content\":
    [ \"type 'a set\", \"\", \"logic add : 'a , 'a set -> 'a set\",
      \"logic mem : 'a , 'a set -> prop\", \"\", \"axiom mem_add:\",
      \"  forall x, y : 'a. forall s : 'a set.\",
      \"     mem(x, add(y, s)) <-> (x = y or mem(x, s))\", \"\",
      \"logic is1, is2 : int set\", \"logic iss : int set set\", \"\", \"goal g:\",
      \"  is1 = is2 ->\", \"    mem (is1, add (is2, iss))\", \"\" ] }"

Options
"{ \"debug\": false, \"debug_ac\": false, \"debug_adt\": false,
  \"debug_arith\": false, \"debug_arrays\": false, \"debug_bitv\": false,
  \"debug_cc\": false, \"debug_combine\": false, \"debug_constr\": false,
  \"debug_explanations\": false, \"debug_fm\": false, \"debug_gc\": false,
  \"debug_interpretation\": false, \"debug_ite\": false, \"debug_matching\": 0,
  \"debug_sat\": false, \"debug_split\": false, \"debug_sum\": false,
  \"debug_triggers\": false, \"debug_types\": false, \"debug_typing\": false,
  \"debug_uf\": false, \"debug_unsat_core\": false, \"debug_use\": false,
  \"debug_warnings\": false, \"rule\": -1,
  \"case_split_policy\": \"AfterTheoryAssume\", \"enable_adts_cs\": false,
  \"max_split\": 1000000, \"input_format\": \"Native\", \"age_bound\": 50,
  \"fm_cross_limit\": 10000, \"steps_bound\": -1, \"interpretation\": 0,
  \"output_format\": \"Native\", \"unsat_core\": true, \"verbose\": false,
  \"instantiation_heuristic\": \"INormal\", \"instanciate_after_backjump\": false,
  \"max_multi_triggers_size\": 4, \"nb_triggers\": 2, \"no_ematching\": false,
  \"no_user_triggers\": false, \"normalize_instances\": false,
  \"triggers_var\": false, \"arith_matchin\": false, \"bottom_classes\": false,
  \"cdcl_tableaux_inst\": false, \"cdcl_tableaux_th\": false,
  \"disable_flat_formulas_simplifiaction\": false, \"enable_restarts\": false,
  \"minimal_bj\": false, \"no_backjumping\": false, \"no_backward\": false,
  \"no_decisions\": false, \"no_sat_learning\": false, \"sat_solver\": \"Tableaux\",
  \"disable_ites\": false, \"inline_lets\": false, \"rewriting\": false,
  \"disable_adts\": false, \"no_ac\": false, \"no_contracongru\": false,
  \"no_fm\": false, \"no_nla\": false, \"no_tcp\": false, \"no_theory\": false,
  \"restricted\": false, \"tighten_vars\": false, \"file\": \"try-alt-ergo-file\" }"
*/