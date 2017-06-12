import { expect } from 'chai';
import {
	CappedQueue
} from '../src/CappedQueue';
import {
	removeEnd
} from '../src/OverflowResolution';

function createQueue() {
	let queue = CappedQueue<number>({
		maxCount: 5
	});
	queue.add(3);
	queue.add(1);
	queue.add(4);
	queue.add(1);
	queue.add(5);
	return queue;
}

describe('CappedQueue', () => {
	describe('#constructor', () => {
		it('should be able to create an empty queue', () => {
			let queue = CappedQueue<number>({
				maxCount: 5
			});
			expect(queue.count).to.equal(0);
		});
		it('should be able to initialize the queue with some items', () => {
			let queue = CappedQueue<number>({
				maxCount: 5
			}, [1, 2, 3, 4]);
			expect(queue.count).to.equal(4);
		});
		it('is expected to throw if initialized with more than maxCount', () => {
			// It is unreasonable to believe any overflowResolver can
			// reduce the count of the initial array with efficiency in a while loop.
			expect(CappedQueue.bind(null, {
				maxCount: 5
			}, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).to.throw('Cannot initialize a CappedQueue with more items than the maxCount.');
		});
	});
	describe('#add', () => {
		it('should be able to add items to the queue, but keep it within maxCount', () => {
			let queue = createQueue();
			expect(queue.count).to.equal(5);
			queue.add(10);
			expect(queue.count).to.equal(5);
			queue.add(11);
			expect(queue.count).to.equal(5);
		});
	});
	describe('#take', () => {
		it('should be able to take items from the queue correctly', () => {
			let queue = createQueue();
			expect(queue.count).to.equal(5);
			let _ = queue.take();
			expect(queue.count).to.equal(4);
			queue.add(10);
			expect(queue.count).to.equal(5);
			queue.add(11);
			expect(queue.count).to.equal(5);
		});
	});
	describe('#clear', () => {
		it('should correctly empty the pingpong when clear is called', () => {
			let queue = createQueue();
			expect(queue.count).to.equal(5);
			queue.clear();
			expect(queue.count).to.equal(0);
		});
	});
});