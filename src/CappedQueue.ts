import { OverflowResolver } from './OverflowResolution';
import { IStockPile } from './StockPile';

interface IOptions<T> {
	maxCount: number;
	overflowResolver: OverflowResolver<T>;
}

/**
 * Creates a first-in-first-out (FIFO) Queue.
 * @param initialItems An array of items that can be used to initialize the Queue.
 */
export function CappedQueue<T>(options: IOptions<T>, initialItems?: T[]): IStockPile<T> {
	let {
		maxCount,
		overflowResolver
	} = options;
	let items: T[] = initialItems || [];

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