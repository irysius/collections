import { PromiseThunk } from '../../src/Helpers';
import { IStockPile } from '../../src/StockPile';

interface ITestPromise {
	thunk: PromiseThunk<void>;
	readonly isExecuting: boolean;
	readonly hasCompleted: boolean;
	readonly expectedEvents: string[];
}
export interface IEventLog {
	event: string;
	time: number;
}
interface IOptions {
	name: string;
	firstDelay?: number;
	secondDelay?: number;
	willFail?: boolean;
	time?: number;
	eventLog?: IStockPile<IEventLog>;
}

function timeSince(startingTime: number) {
	return new Date().getTime() - startingTime;
}
export function TestPromise(options: IOptions): ITestPromise {
	let {
		firstDelay = 1,
		secondDelay = 1,
		willFail = false,
		name,
		time = new Date().getTime(),
		eventLog
	} = options;
	let hasCompleted = false;
	let events = [
		`${name}::0th::thunk`,
		`${name}::1st::start`,
		`${name}::1st::end..`,
		`${name}::2nd::start`,
		`${name}::2nd::end..`
	];

	function createPromise(delay: number, events: [string, string]) {
		return new Promise<void>((resolve, reject) => {
			eventLog && eventLog.add({
				event: events[0],
				time: timeSince(time)
			});
			setTimeout(() => {
				eventLog && eventLog.add({
					event: events[1],
					time: timeSince(time)
				});
				hasCompleted = true;
				willFail ? reject(new Error('Intentional error.')) : resolve();
			}, delay);
		});
	}
	function thunk() {
		eventLog && eventLog.add({
			event: events[0],
			time: timeSince(time)
		});
		return createPromise(firstDelay, [events[1], events[2]]).then(() => {
			return createPromise(secondDelay, [events[3], events[4]]);
		});
	}

	let proxy = {
		thunk: thunk
	};
	Object.defineProperty(proxy, 'hasCompleted', {
		get: () => hasCompleted,
		enumerable: true
	});
	Object.defineProperty(proxy, 'expectedEvents', {
		get: () => events.slice(),
		enumerable: true
	});
	return proxy as ITestPromise;
}
