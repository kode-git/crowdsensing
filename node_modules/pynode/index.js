/**
 * Bi-directional communication b/w node and python
 *
 * Executes the python script
 *
 * @return {Promise}
 */


var Q = require('q'),
	spawn = require('child_process').spawn;

/* Executes the python process.
 * Promise resolved with stdout of the process.
 *
 * @param {String}
 *
 * @return {Promise}
 *
 */


module.exports = {

	exec : function(filename, arguments, options){

		var dfd = Q.defer(),
			output = [];

		options = options || {};
		arguments = arguments || '';

		/* check input,
		 * filename to run (should have)
		 * any arguments (optional)
		 * other options (optional)
		*/
		if(filename == "" || filename == undefined){
			dfd.reject('Please specify python filename');
		}

		python = spawn('python', [filename]);

		python.stdin.setEncoding('utf8');
		python.stdout.setEncoding('utf8');

		python.stdout.on('data', function(data){
			output.push(data);
		});

		// if some error throw reject promise
		python.stderr.on('data', function(data){
			dfd.reject(data.toString());
		});

		python.stdout.on('close', function(d){
			var result = output.join().trim();

			// resolve the result
			dfd.resolve(result);
		});

		// check if arguments present or not
		if(arguments.length > 0){
			// var args = {};
			// send arguments
			python.stdin.write(JSON.stringify(arguments));
			// terminate the stdin will terminate the process
			python.stdin.end();
		}

		return dfd.promise;

	}

}