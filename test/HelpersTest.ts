import { expect } from 'chai';
import {
	asSkipTake,
	canBeInteger,
	coalesceNumber,
	createIndexer,
	createRanges,
	flatMap,
	rangeAsArray,
	shuffle,
	IRange
} from '../src/Helpers';

describe('Helpers', () => {
	describe('#asSkipTake', () => {
		it('should correctly work for a count of 1', () => {
			let range: IRange = { start: 0, end: 0 };
			let { skip, take } = asSkipTake(range);
			expect(skip).to.equal(0);
			expect(take).to.equal(1);
		});
		it('should correctly work for normal ranges', () => {
			let range: IRange = { start: 10, end: 19 };
			let { skip, take } = asSkipTake(range);
			expect(skip).to.equal(10);
			expect(take).to.equal(10);
		});
		it('should throw if provided with an invalid range', () => {
			let negativeRange: IRange = { start: 10, end: 0 };
			expect(asSkipTake.bind(null, negativeRange)).to.throw('An invalid range has been passed to asSkipTake.');
		});
	});
	describe('#canBeInteger', () => {
		it('should consider integers as integers', () => {
			expect(canBeInteger(13)).to.be.true;
		});
		it('should not consider decimals as integers', () => {
			expect(canBeInteger(1.3)).to.be.false;
			expect(canBeInteger('1.3')).to.be.false;
		});
		it('should consider strings representing integers as integers', () => {
			expect(canBeInteger('3')).to.be.true;
		});
		it('should not consider dates as integers', () => {
			let date = new Date(0);
			expect(canBeInteger(date)).to.be.false;
		});
		it('should not consider nulls as integers', () => {
			expect(canBeInteger(null)).to.be.false;
		});
		it('should not consider undefineds as integers', () => {
			expect(canBeInteger(undefined)).to.be.false;
		});
		it('should not consider booleans as integers', () => {
			expect(canBeInteger(true)).to.be.false;
			expect(canBeInteger(false)).to.be.false;
		});
		it('should not consider objects, arrays, or functions as integers', () => {
			expect(canBeInteger({})).to.be.false;
			expect(canBeInteger([])).to.be.false;
			function noop() { }
			expect(canBeInteger(noop)).to.be.false;
		});
	});
	describe('#coalesceNumber', () => {
		it('should be able to return the provided value if the provided value is 0', () => {
			let expected = 0;
			expect(coalesceNumber(expected, 123)).to.equal(expected);
		});
		it('should be able to return the provided value if the provided value is a number', () => {
			let expected = 234;
			expect(coalesceNumber(expected, 123)).to.equal(expected);
		});
		it("should be able to return the default value if the provided value doesn't exist", () => {
			let expected = void 0;
			expect(coalesceNumber(expected, 123)).to.equal(123);
		});
	});
	describe('#createIndexer', () => {
		let item = {
			name: 'TestItem',
			itemId: 17,
			deleted: false
		};
		type Item = typeof item;
		it('should recognize indexer functions as an indexer already', () => {
			let indexer = createIndexer<Item>(x => x.itemId);
			expect(indexer).to.be.a('function');
			expect(indexer(item)).to.equal(17);
		});
		it('should be able to create an indexer from a string', () => {
			let indexer = createIndexer('itemId');
			expect(indexer).to.be.a('function');
			expect(indexer(item)).to.equal(17);
		});
		it('should fail to create an indexer from an empty string', () => {
			expect(createIndexer.bind(null, '')).to.throw('Attempted to create an indexer from an empty string');
		});
	});
	describe.skip('#createRanges', () => {
		let emptyRange: number[] = [];
		let contiguousRange = [4, 5, 6, 7, 8, 9, 10];
		let spottyRange = [3, 4, 8, 10, 12, 13, 16, 17, 21, 22, 23, 33, 34, 46, 50, 51, 53];
		let reversedRange = [5, 4, 3, 2, 1];
		it('should return an empty array if an empty array is passed', () => {
			expect(createRanges(emptyRange)).to.deep.equal([]);
		});
		it('should be able to create a single range from a contiguous range of numbers', () => {
			let expected: IRange[] = [{ start: 4, end: 10 }];
			expect(createRanges(contiguousRange)).to.deep.equal(expected);
		});
		it('should be able to create many ranges from a broken up range of numbers', () => {
			let expected: IRange[] = [
				{ start: 3, end: 4 },
				{ start: 8, end: 8 },
				{ start: 10, end: 10 },
				{ start: 12, end: 13 },
				{ start: 16, end: 17 },
				{ start: 21, end: 23 },
				{ start: 33, end: 34 },
				{ start: 50, end: 51 },
				{ start: 53, end: 53 }
			];
			expect(createRanges(spottyRange)).to.deep.equal(expected);
		});
		it('should be able to create ranges over a gap of one', () => {
			let expected: IRange[] = [
				{ start: 3, end: 4 },
				{ start: 8, end: 13 },
				{ start: 16, end: 17 },
				{ start: 21, end: 23 },
				{ start: 33, end: 34 },
				{ start: 46, end: 46 },
				{ start: 50, end: 53 }
			];
			expect(createRanges(spottyRange, { maxGapSize: 1 })).to.deep.equal(expected);
		});
		it('should be able to create ranges over a gap of two', () => {
			let expected: IRange[] = [
				{ start: 3, end: 4 },
				{ start: 8, end: 17 },
				{ start: 21, end: 23 },
				{ start: 33, end: 34 },
				{ start: 46, end: 46 },
				{ start: 50, end: 53 }
			];
			expect(createRanges(spottyRange, { maxGapSize: 2 })).to.deep.equal(expected);
		});
		it('should be able to create ranges over a gap of ten', () => {
			let expected: IRange[] = [
				{ start: 3, end: 34 },
				{ start: 46, end: 53 }
			];
			expect(createRanges(spottyRange, { maxGapSize: 10 })).to.deep.equal(expected);
		});
		it('should throw if attempting to create ranges over a negative gap', () => {
			expect(createRanges.bind(null, spottyRange, { maxGapSize: -1 })).to.throw('Cannot createRanges with a negative maxGapSize.');
		});
		it('should throw if the range is not in ascending order', () => {
			expect(createRanges.bind(null, reversedRange)).to.throw('Cannot createRanges using a non-ascending numerical array.');
		});
	});
	describe('#flatMap', () => {
		it('should work with an empty array', () => {
			expect(flatMap([])).to.deep.equal([]);
		});
		it('should work with a two level nested array', () => {
			let test = [
				[23, 24],
				[1, 2, 3],
				[5, 6],
				[10, 11]
			];
			let expected = [23, 24, 1, 2, 3, 5, 6, 10, 11];
			expect(flatMap(test)).to.deep.equal(expected);
		});
		it('should only flatten the first two levels of nested arrays', () => {
			let test = [
				[23, [1, 2]],
				[1, 2, 3],
				[5, 6],
				[[3, 4, 5], 11]
			];
			let expected = [23, [1, 2], 1, 2, 3, 5, 6, [3, 4, 5], 11];
			expect(flatMap(test)).to.deep.equal(expected);
		});
	});
	describe('#rangeAsArray', () => {
		it('should return the correct numerical array with a count of 1', () => {
			let expected = [10];
			expect(rangeAsArray({ start: 10, end: 10 })).to.deep.equal(expected);
		});
		it('should return the correct numerical array', () => {
			let expected = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5];
			expect(rangeAsArray({ start: -5, end: 5 })).to.deep.equal(expected);
		});
		it('should throw if provided with an invalid range', () => {
			expect(rangeAsArray.bind(null, { start: 13, end: 12 })).to.throw('An invalid range has been passed to rangeAsArray.');
		});
	});
	describe('#shuffle', () => {
		it('should contain the same number of elements after shuffling', () => {
			let shuffled = shuffle([1, 2, 3, 4, 5]);
			expect(shuffled).to.have.lengthOf(5);
			expect(shuffled).to.contain(1);
			expect(shuffled).to.contain(2);
			expect(shuffled).to.contain(3);
			expect(shuffled).to.contain(4);
			expect(shuffled).to.contain(5);
		});
	});
});