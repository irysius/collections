import { expect } from 'chai';
import { add, multiply } from './../src/sample';
describe('Sample', () => {
	it('should add correctly', () => {
		expect(add(1, 1)).to.equal(2);
	});
	it('should multiply correctly', () => {
		expect(multiply(3, 4)).to.equal(12);
	});
	it('should fail', () => {
		expect(add(1, 1)).to.equal(4);
	});
});