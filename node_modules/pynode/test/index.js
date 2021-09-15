var chai = require('chai'),
	should = chai.should(),
	expect = chai.expect,
	chaiAsPromised = require('chai-as-promised'),
	pynode = require('../index');

describe('Test runs', () => {

	it('it should run the specified file and return contents', (done) => {
		var res = pynode.exec(__dirname + '/../examples/' + 'test.py');

		res.then((d) => {
			try{
				d = d[0].replace(/'/g, '"').replace(/\r?\n|\r/g, '');
				expect(d).to.equal('hello');
				done();
			}catch(e){
				done(e);
			}
		});

	});


	it('it should return the array of print statements from python', (done) => {
		var res = pynode.exec(__dirname + '/../examples/' + 'second.py');

		res.then((d) => {
			const shouldbe = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
			try{
				d = d[0].replace(/'/g, '"').replace(/\r?\n|\r/g, '');
				d = JSON.parse(d);
				expect(d).to.be.instanceof(Array);
				expect(d).to.deep.equal(shouldbe);
				done();
			}catch(e){
				done(e);
			}
		})

	});

	it('should fail with no file found', (done) => {
		expect(pynode.exec(__dirname + '/../examples/' + 'somename.py'))
			.to.be.rejected;
			// .to.be.an.instanceof('Error');
		done();
	});

	it('should return my sent arguments', (done) => {
		var args = ['foo', 'bar', 'baz'];
		var res = pynode.exec(__dirname + '/../examples/' + 'third.py', args);

		res.then((d) => {
			const shouldbe = ['foo', 'bar', 'baz'];
			try{
				d = d[0].replace(/'/g, '"').replace(/\r?\n|\r/g, '');
				d = JSON.parse(d);
				expect(d).to.be.instanceof(Array);
				expect(d).to.deep.equal(shouldbe);
				done();
			}catch(e){
				done(e);
			}
		})
	});

})