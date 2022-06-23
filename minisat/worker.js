(async () => { 
	const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
	var Module = require('./minisat.js');
	await delay(1000);
	var solve_string = Module.cwrap('solve_string', 'string', ['string', 'number']);

	onmessage = function(e) {
		console.log('Message received from main script');
		const problem = e.data;
		var result = solve_string(problem, problem.length);
		console.log('Posting message back to main script');
		postMessage(result);
	}
})()

