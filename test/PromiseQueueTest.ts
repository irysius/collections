import { expect } from 'chai';
import * as sinon from 'sinon';
import { PromiseThunk, flatMap } from '../src/Helpers';
import { Queue, IStockPile } from '../src/StockPile';
import { AlertingStockPile } from './helpers/AlertingStockPile';
import { TestPromise, IEventLog } from './helpers/TestPromise';
import {
	PromiseQueue
} from '../src/PromiseQueue';


// TODO: Error handling
describe('PromiseQueue', () => {
	describe('#enqueue', () => {
		it('should add the thunk to the internal collection', () => {
			let queue = Queue<PromiseThunk<any>>();
			let addSpy = sinon.spy(queue, 'add');
			let pQueue = PromiseQueue({ collection: queue });
			let p = TestPromise({ name: 'enqueue-add' });
			pQueue.enqueue(p.thunk);
			expect(addSpy.calledOnce, 'expected queue.add to be called once').to.be.true;
		});
		it('is expected that the first thunk added should be immediately taken', () => {
			let queue = Queue<PromiseThunk<any>>();
			let addSpy = sinon.spy(queue, 'add');
			let takeSpy = sinon.spy(queue, 'take');
			let pQueue = PromiseQueue({ collection: queue });
			let p = TestPromise({ name: 'enqueue-take'});
			pQueue.enqueue(p.thunk);
			expect(addSpy.calledOnce, 'expected queue.add to be called once').to.be.true;
			expect(takeSpy.calledOnce, 'expected queue.take to be called once').to.be.true;
		});
	});
	describe('#clear', () => {
		it('should call clear on the internal collection', () => {
			let queue = Queue<PromiseThunk<any>>();
			let clearSpy = sinon.spy(queue, 'clear');
			let pQueue = PromiseQueue({ collection: queue });
			pQueue.clear();
			expect(clearSpy.calledOnce, 'expected queue.take to be called once').to.be.true;
		});
	});
	describe('instance', () => {
		it('should be able to encounter a failing promise and continue resolving the rest', () => {
			let queue = Queue<PromiseThunk<any>>();
			let pQueue = PromiseQueue({ collection: queue });
			let now = new Date().getTime();
			let collection = AlertingStockPile<IEventLog>({
				expectedCount: 5 + 3 + 5,
				timeout: 5 * 1000
			});
			let promises = [
				TestPromise({ name: 'fail-1', time: now, eventLog: collection }),
				TestPromise({ name: 'fail-2', time: now, eventLog: collection, willFail: true }),
				TestPromise({ name: 'fail-3', time: now, eventLog: collection })
			];
			promises.forEach(p => {
				pQueue.enqueue(p.thunk);
			});

			collection.begin();
			return collection.promise.then(logs => {
				let actualEvents = logs.map(l => l.event);
				let expectedEvents = [
					...promises[0].expectedEvents,
					promises[1].expectedEvents[0],
					promises[1].expectedEvents[1],
					promises[1].expectedEvents[2],
					...promises[2].expectedEvents
				];
				expect(actualEvents).to.deep.equal(expectedEvents);

				let hasCompleteds = promises.map(p => p.hasCompleted);
				expect(hasCompleteds).to.deep.equal([true, true, true]);
			});
		});
		it('should be processing a single promise at a time', () => {
			let queue = Queue<PromiseThunk<any>>();
			let pQueue = PromiseQueue({ collection: queue });
			let now = new Date().getTime();
			let collection = AlertingStockPile<IEventLog>({
				expectedCount: 5 * 3,
				timeout: 5 * 1000				
			});
			let promises = [
				TestPromise({ name: 'ordered-1', time: now, eventLog: collection }),
				TestPromise({ name: 'ordered-2', time: now, eventLog: collection }),
				TestPromise({ name: 'ordered-3', time: now, eventLog: collection })
			];
			promises.forEach(p => {
				pQueue.enqueue(p.thunk);
			});

			collection.begin();
			return collection.promise.then(logs => {
				let actualEvents = logs.map(l => l.event);
				let expectedEvents = flatMap(promises.map(p => p.expectedEvents));
				expect(actualEvents).to.deep.equal(expectedEvents);

				let hasCompleteds = promises.map(p => p.hasCompleted);
				expect(hasCompleteds).to.deep.equal([true, true, true]);
			});
		});
	});
});