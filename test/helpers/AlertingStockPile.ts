import { IStockPile } from '../../src/StockPile';
export interface IAlertingStockPile<T> extends IStockPile<T> {
	/**
	 * Will resolve with the contents of the stock pile, or throw if it times out.
	 */
	readonly promise: Promise<T[]>;
	/**
	 * Starts the timer for a timeout error.
	 */
	begin(): void;
}
interface IOptions {
	expectedCount: number;
	timeout: number;
}

/**
 * Creates a collection that resolves a promise when it's full
 */
export function AlertingStockPile<T>(options: IOptions) {
	let {
		expectedCount,
		timeout
	} = options;
	let items: T[] = [];
	let fulfilled = false;
	let begun = false;
	let _resolve: (items: T[]) => void;
	let _reject: (error: Error) => void;
	let promise = new Promise<T[]>((resolve, reject) => {
		_resolve = resolve;
		_reject = reject;
	});
	function add(item: T): void {
		items.push(item);
		if (items.length === expectedCount && !fulfilled) {
			fulfilled = true;
			_resolve(items.slice());
		}
	}
	function take(): T|undefined {
		throw new Error('AlertingStockPile cannot implement take');
	}
	function clear() {
		throw new Error('AlertingStockPile cannot implement clear.');
	}
	function begin() {
		if (!begun) {
			begun = true;
			setTimeout(() => {
				if (!fulfilled) {
					fulfilled = true;
					_reject(new Error(`AlertingStockPile could not meet the expected count in time.`));
				}
			}, timeout);
		}
	}

	let proxy = {
		add, take, clear, begin
	};
	Object.defineProperty(proxy, 'count', {
		get: () => items.length,
		enumerable: true
	});
	Object.defineProperty(proxy, 'promise', {
		get: () => promise,
		enumerable: true
	});
	
	return proxy as IAlertingStockPile<T>;
}