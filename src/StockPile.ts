export interface IStockPileFactory<T> {
	(initialItems?: T[]): IStockPile<T>;
}

/**
 * Interface for a collection of items with arbitrary add and remove characteristics.
 */
export interface IStockPile<T> {
	add(item: T): void;
	take(): T|undefined;
	clear(): void;
	readonly count: number;
}

/**
 * Creates a first-in-first-out (FIFO) Queue.
 * @param initialItems An array of items that can be used to initialize the Queue.
 */
export function Queue<T>(initialItems?: T[]): IStockPile<T> {
	let items: T[] = initialItems || [];
	function add(item: T): void {
		items.push(item);
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

/**
 * Creates a last-in-first-out (LIFO) Stack.
 * @param initialItems An array of items that can be used to initialize the Stack.
 */
export function Stack<T>(initialItems?: T[]): IStockPile<T> {
	let items: T[] = initialItems || [];
	function add(item: T): void {
		items.push(item);
	}
	function take(): T|undefined {
		return items.pop();
	}
	function clear() {
		items = [];
	}

	let proxy = {
		add, take
	};
	Object.defineProperty(proxy, 'count', {
		get: () => items.length,
		enumerable: true
	});
	return proxy as IStockPile<T>;
}

/**
 * Creates a collection that alternates between removing elements from the start and end.
 * @param initialItems An array of items that can be used to initialize the PingPong.
 */
export function PingPong<T>(initialItems?: T[]): IStockPile<T> {
	let items: T[] = initialItems || [];
	let fromEnd = true;
	function add(item: T): void {
		items.push(item);
	}
	function take(): T|undefined {
		fromEnd = !fromEnd;
		return fromEnd ? items.pop() : items.shift();
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
