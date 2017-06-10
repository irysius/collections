import { expect } from 'chai';
import * as sinon from 'sinon';
import { PromiseThunk, flatMap, wait } from '../src/Helpers';
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
					...promises[1].expectedEvents.slice(0, 3),
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
				timeout: 3 * 1000				
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
		it('should be able to finish processing a chain, then pick up another chain of events', () => {
			let queue = Queue<PromiseThunk<any>>();
			let pQueue = PromiseQueue({ collection: queue });
			let now1 = new Date().getTime();
			let collection1 = AlertingStockPile<IEventLog>({
				expectedCount: 5 * 3,
				timeout: 3 * 1000				
			});
			let promises1 = [
				TestPromise({ name: 'chain-1-1', time: now1, eventLog: collection1 }),
				TestPromise({ name: 'chain-1-2', time: now1, eventLog: collection1 }),
				TestPromise({ name: 'chain-1-3', time: now1, eventLog: collection1 })
			];
			promises1.forEach(p => {
				pQueue.enqueue(p.thunk);
			});

			collection1.begin();
			return collection1.promise.then(logs => {
				let actualEvents = logs.map(l => l.event);
				let expectedEvents = flatMap(promises1.map(p => p.expectedEvents));
				expect(actualEvents).to.deep.equal(expectedEvents);

				let hasCompleteds = promises1.map(p => p.hasCompleted);
				expect(hasCompleteds).to.deep.equal([true, true, true]);
				return wait(250);
			}).then(() => {
				// Second rush of promises.
				let now2 = new Date().getTime();
				let collection2 = AlertingStockPile<IEventLog>({
					expectedCount: 5 * 3,
					timeout: 3 * 1000				
				});
				let promises2 = [
					TestPromise({ name: 'chain-2-1', time: now2, eventLog: collection2 }),
					TestPromise({ name: 'chain-2-2', time: now2, eventLog: collection2 }),
					TestPromise({ name: 'chain-2-3', time: now2, eventLog: collection2 })
				];
				promises2.forEach(p => {
					pQueue.enqueue(p.thunk);
				});

				collection2.begin();
				return collection2.promise.then(logs => {
					let actualEvents = logs.map(l => l.event);
					let expectedEvents = flatMap(promises2.map(p => p.expectedEvents));
					expect(actualEvents).to.deep.equal(expectedEvents);

					let hasCompleteds = promises2.map(p => p.hasCompleted);
					expect(hasCompleteds).to.deep.equal([true, true, true]);
				});
			});
		});
		it('should be able to timeout on long running promises, and handle it like an error', () => {
			let queue = Queue<PromiseThunk<any>>();
			let pQueue = PromiseQueue({ collection: queue, timeout: 1000 });
			let now = new Date().getTime();
			let collection = AlertingStockPile<IEventLog>({
				expectedCount: 5 + 4 + 5,
				timeout: 3 * 1000				
			});
			let promises = [
				TestPromise({ name: 'timeout-1', time: now, eventLog: collection }),
				TestPromise({ name: 'timeout-2', time: now, eventLog: collection, firstDelay: 500, secondDelay: 750 }),
				TestPromise({ name: 'timeout-3', time: now, eventLog: collection })
			];
			promises.forEach(p => {
				pQueue.enqueue(p.thunk);
			});

			collection.begin();
			return collection.promise.then(logs => {
				let actualEvents = logs.map(l => l.event);
				let expectedEvents = [
					...promises[0].expectedEvents,
					...promises[1].expectedEvents.slice(0, 4),
					...promises[2].expectedEvents
				];
				expect(actualEvents).to.deep.equal(expectedEvents);

				let hasCompleteds = promises.map(p => p.hasCompleted);
				expect(hasCompleteds).to.deep.equal([true, true, true]);
			});
		});
	});
});