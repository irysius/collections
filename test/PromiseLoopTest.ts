import { expect } from 'chai';
import {
	pLoop
} from '../src/PromiseLoop';

interface IContext {
	count: number;
}

describe.only('PromiseLoop', () => {
	function promiseA(context: IContext) {
		context.count++;
		console.log('A');
		return Promise.resolve('A');
	}
	function promiseB(context: IContext) {
		context.count++;
		console.log('B');
		return 'B';
	}
	function promiseC(context: IContext) {
		console.log('C');
	}
	function promiseD() {
		console.log('D');
		return 'D';
	}
	function promiseE(context: IContext, index: number): string {
		console.log('E');
		context.count++;
		if (index % 2 === 0) {
			return 'E1';
		} else {
			return 'E2';
		}
	}
	function promiseF(context: IContext) {
		console.log('F');
		context.count++;
		return Promise.resolve('F');
	}

	function condTrue() {
		return true;
	}
	function condCount(context: IContext) {
		return context.count < 2;
	}

	it('should be able act like Promise.seq if cond always returns true', () => {
		let steps = [
			promiseA, promiseB, promiseC, promiseD, promiseE, promiseF
		];
		return pLoop<string>(steps, condTrue, { count: 0 }).then(results => {
			let result = results.join('');
			expect(result).to.equal('ABDE1F');
		});
	});
	it('should be able to break early without executing the remaining Promises', () => {
		let steps = [
			promiseA, promiseB, promiseC, promiseD, promiseE, promiseF
		];
		return pLoop<string>(steps, condCount, { count: 0 }).then(results => {
			let result = results.join('');
			expect(result).to.equal('AB');
		});
	});
});