import { OverflowResolver } from './OverflowResolution';
import { IStockPile } from './StockPile';

interface IOptions<T> {
	maxCount: number;
	overflowResolver?: OverflowResolver<T>;
}

function identity<T>(items: T[]) {
	return items;
}

/**
 * Creates a first-in-first-out (FIFO) Queue.
 * @param initialItems An array of items that can be used to initialize the Queue.
 */
export function CappedQueue<T>(options: IOptions<T>, initialItems?: T[]): IStockPile<T> {
	
	let {
		maxCount,
		overflowResolver = identity
	} = options;
	let items: T[] = initialItems || [];
	if (items.length > maxCount) { 
		throw new Error('Cannot initialize a CappedQueue with more items than the maxCount.'); 
	}

	function add(item: T): void {
		if (items.length >= maxCount) {
			items = overflowResolver(items);
		}
		// An overflow resolver might not remove enough items.
		if (items.length < maxCount) {
			items.push(item);
		}
	}
	function take(): T|undefined {
		return items.shift();
	}
	function clear() {
		items = [];
	}

	let proxy = {
		add, take, clear
	};
	Object.defineProperty(proxy, 'count', {
		get: () => items.length,
		enumerable: true
	});
	return proxy as IStockPile<T>;
}