var fs = require('fs');

async function f(){
	const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
	var Module = require('./build/minisat.js');
	await delay(1000);
	// Testing function.
	var solve_string = Module.cwrap('solve_string', 'string', ['string', 'number']);
	function test(problem, expected) {
		console.log('Trying to solve: ' + problem.substring(0,100))
		var result = solve_string(problem, problem.length);
		console.log('Got: ' + result);
		console.log('Expected: ' + expected);
	}

	// Tiny testcases.
	test('p cnf 3 2\n1 -3 0\n2 3 -1 0', 'SAT 1 2 -3');
	test('hi', 'parse error');
	test('p cnf 1 2\n1 0\n-1 0', 'UNSAT');
	
	
	const cnf = fs.readFileSync('/home/satos/toys/nazotoki-tools/butadic/tes.cnf').toString();
	test(cnf,"How?");
}

f()

