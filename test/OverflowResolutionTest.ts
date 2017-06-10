import { expect } from 'chai';
import {
	removeStart,
	removeEnd,
	dropFirstHalf,
	dropLatterHalf,
	dropMiddle,
	dropRandom
} from '../src/OverflowResolution';

function createEvenArray() {
	let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	return numbers.slice();
}
function createOddArray() {
	let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
	return numbers.slice();
}

describe('OverflowResolution', () => {
	describe('#removeStart', () => {
		it('should return empty if provided with an empty array', () => {
			expect(removeStart([])).to.deep.equal([]);
		});
		it('should work with an single element', () => {
			let items = [1];
			let result = removeStart(items);
			expect(items).to.deep.equal(items);
			expect(result).to.deep.equal([]);
		});
		it('should return a new array without the starting element', () => {
			let items = createEvenArray();
			let result = removeStart(items);
			expect(items).to.deep.equal(items);
			expect(result).to.deep.equal([2, 3, 4, 5, 6, 7, 8, 9, 10]);
		});
	});
	describe('#removeEnd', () => {
		it('should return empty if provided with an empty array', () => {
			expect(removeEnd([])).to.deep.equal([]);
		});
		it('should work with an single element', () => {
			let items = [1];
			let result = removeEnd(items);
			expect(items).to.deep.equal(items);
			expect(result).to.deep.equal([]);
		});
		it('should return a new array without the ending element', () => {
			let items = createEvenArray();
			let result = removeEnd(items);
			expect(items).to.deep.equal(items);
			expect(result).to.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9]);
		});
	});
	describe('#dropFirstHalf', () => {
		it('should return empty if provided with an empty array', () => {
			expect(dropFirstHalf([])).to.deep.equal([]);
		});
		it('should work with an single element', () => {
			let items = [1];
			let result = dropFirstHalf(items);
			expect(items).to.deep.equal(items);
			expect(result).to.deep.equal([]);
		});
		it('should work with even number of elements', () => {
			let items = createEvenArray();
			let result = dropFirstHalf(items);
			expect(items).to.deep.equal(items);
			expect(result).to.deep.equal([6, 7, 8, 9, 10]);
		});
		it('should work with odd number of elements', () => {
			let items = createOddArray();
			let result = dropFirstHalf(items);
			expect(items).to.deep.equal(items);
			expect(result).to.deep.equal([6, 7, 8, 9]);
		});
	});
	describe('#dropLatterHalf', () => {
		it('should return empty if provided with an empty array', () => {
			expect(dropLatterHalf([])).to.deep.equal([]);
		});
		it('should work with an single element', () => {
			let items = [1];
			let result = dropLatterHalf(items);
			expect(items).to.deep.equal(items);
			expect(result).to.deep.equal([]);
		});
		it('should work with even number of elements', () => {
			let items = createEvenArray();
			let result = dropLatterHalf(items);
			expect(items).to.deep.equal(items);
			expect(result).to.deep.equal([1, 2, 3, 4, 5]);
		});
		it('should work with odd number of elements', () => {
			let items = createOddArray();
			let result = dropLatterHalf(items);
			expect(items).to.deep.equal(items);
			expect(result).to.deep.equal([1, 2, 3, 4]);
		});
	});
	describe('#dropMiddle', () => {
		it('should return empty if provided with an empty array', () => {
			expect(dropMiddle([])).to.deep.equal([]);
		});
		it('should work with an single element', () => {
			let items = [1];
			let result = dropMiddle(items);
			expect(items).to.deep.equal(items);
			expect(result).to.deep.equal([]);
		});
		it('should work with even even number of elements', () => {
			let items = [1, 2, 3, 4, 5, 6, 7, 8];
			let result = dropMiddle(items);
			expect(items).to.deep.equal(items);
			expect(result).to.deep.equal([1, 2, 7, 8]);
		});
		it('should work with even odd number of elements', () => {
			let items = createEvenArray();
			let result = dropMiddle(items);
			expect(items).to.deep.equal(items);
			expect(result).to.deep.equal([1, 2, 9, 10]);
		});
		it('should work with odd number of elements', () => {
			let items = createOddArray();
			let result = dropMiddle(items);
			expect(items).to.deep.equal(items);
			expect(result).to.deep.equal([1, 2, 8, 9]);
		});
	});
	describe('#dropRandom', () => {
		it('should return empty if provided with an empty array', () => {
			expect(dropRandom(.5, [])).to.deep.equal([]);
		});
		it('should drop nothing if percent is 0', () => {
			let expected = [1, 2, 3, 4];
			let results = dropRandom(0, expected);
			expect(results).to.have.lengthOf(expected.length);
			expect(results).to.contain(1);
			expect(results).to.contain(2);
			expect(results).to.contain(3);
			expect(results).to.contain(4);
		});
		it('should drop everything if percent exceeds 1', () => {
			let expected = [1, 2, 3, 4];
			expect(dropRandom(1, expected)).to.have.lengthOf(0);
			expect(dropRandom(2, expected)).to.have.lengthOf(0);
		});
		it('should throw if percent is negative', () => {
			let expected = [1, 2, 3, 4];
			expect(dropRandom.bind(null, -1, expected)).to.throw('dropRandom cannot accept a negative drop percentage.');
		});
		it('should drop half the items if percent is 0.5', () => {
			let expected = [1, 2, 3, 4];
			expect(dropRandom(0.5, expected)).to.have.lengthOf(2);
		});
		it('should drop a quarter of the items if percent is 0.25', () => {
			let expected = [1, 2, 3, 4];
			expect(dropRandom(0.25, expected)).to.have.lengthOf(3);
		});
	});
});