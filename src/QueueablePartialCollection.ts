import {
	IMap, Mapper, IRange,
	asSkipTake,
	createIndexer,
	createRanges,
	coalesceNumber,
	canBeInteger
} from './Helpers';
import { PartialCollection } from './PartialCollection';

interface IOptions<T, U> {
	fetcher: (range: IRange) => Promise<U[]>;
	identifier?: string|Mapper<U, T>;
	indexer: string|Mapper<U, number>;
	maxCount?: number;
}
interface IQueueablePartialCollection<T, U> {
	maxCount?: number;
	queueRange(range: IRange): void;
	on(event: 'update', callback: OnItemsReceived): void;
	get(index: number): T|null|undefined;
	fetchIfExists(range: IRange): T[]|null;
	load(items: U[]): T[];
	unload(items: U[]): void;
	unloadRange(range: IRange): void;
}
type OnItemsReceived = () => void;

export function QueueablePartialCollection<U extends object, T extends object = U>(options: IOptions<T, U>) {
	// indexed hash of queued items
	let internal: IMap<boolean> = { };
	let {
		indexer, maxCount
	} = options;

	let collection = PartialCollection(options);
	let listeners: OnItemsReceived[] = [];

	let _indexer = createIndexer(indexer);

	function throwIfUninitialized() {
		if (typeof maxCount !== 'number') {
			throw new Error('QueueablePartialCollection requires maxCount to be set to operate correctly.');
		}
	}

	function queueRange(range: IRange): void {
		throwIfUninitialized();
		let { skip, take } = asSkipTake(range);
		let count = Math.min(skip + take, maxCount!);
		let i;
		let unqueued: number[] = [];
		for (i = skip; i < count; ++i) {
			let queued = internal['' + i];
			if (!queued) { 
				internal['' + i] = true;
				unqueued.push(i);
			}
		}
		let ranges = createRanges(unqueued);

		// Intentionally not returning the promise.
		Promise.all(ranges.map(collection.fetch)).then(() => {
			listeners.forEach(listener => { 
				try {
					listener();
				} catch (e) {
					// maybe warn?
				}
			});
		});
	}

	function on(event: string, callback: OnItemsReceived): void {
		switch (event) {
			case 'update':
				return;
		}
	}
	function fetchIfExists(range: IRange): T[]|null {
		throwIfUninitialized();
		let { skip, take } = asSkipTake(range);
		let count = Math.min(skip + take, maxCount!);
		let i; let results: T[] = [];
		for (i = skip; i < count; ++i) {
			let item = collection.get(i);
			if (item == null) { 
				return null; 
			} else {
				results.push(item);
			}
		}
		return results;
	}
	function load(items: U[]): T[] {
		throwIfUninitialized();
		items.forEach((item, i) => {
			let index = _indexer(item);
			// Sanity check
			if (canBeInteger(index)) {
				if (index < maxCount!) {
					internal[index] = true;
				}
			}
		});
		return collection.load(items);
	}
	function unload(items: U[]): void {
		items.forEach(item => {
			let index = _indexer(item);
			// more relaxed about indexing errors.
			removeByIndex(index);
		});
	}
	function unloadRange(range: IRange): void {
		let { skip, take } = asSkipTake(range);
		let count = Math.min(skip + take, coalesceNumber(maxCount, Infinity));
		let i;
		for (i = skip; i < count; ++i) {
			removeByIndex(i);
		}
	}
	function removeByIndex(index: number): void {
		collection.removeByIndex(index);
		delete internal['' + index];
	}

	let proxy = {
		queueRange: queueRange,
		on: on,
		get: collection.get,
		fetchIfExists: fetchIfExists,
		load: load,
		unload: unload,
		unloadRange: unloadRange,
		removeByIndex: removeByIndex
	};
	Object.defineProperty(proxy, 'maxCount', {
		get: () => maxCount,
		set: (value: number) => { 
			if (typeof value === 'number' && !isNaN(value))	{
				maxCount = value;
			}
		}
	});
}