
onmessage = function(e) {
  console.log('Worker is not ready');
  this.postMessage({status:"error"})
}

var _ = (async () => { 
	const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
	await delay(1000);
	var solve_string = Module.cwrap('solve_string', 'string', ['string', 'number']);
  console.log('Inited web worker');
	onmessage = function(e) {
		const problem = e.data;
		console.log('Message received from main script',String(problem).substr(0,100));
		var result = solve_string(problem, problem.length);
		console.log('Posting message back to main script');
		postMessage({
      status: "ok",
      result
    });
	}
})();
