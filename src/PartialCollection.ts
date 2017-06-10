import { 
	IMap, Mapper, IRange, 
	asSkipTake,
	createIndexer,
	canBeInteger,
	flatMap,
	coalesceNumber
} from './Helpers'

interface IOptions<T, U> {
	fetcher: (range: IRange) => Promise<U[]>;
	identifier?: string|Mapper<U, T>;
	indexer: string|Mapper<U, number>;
	maxCount?: number;
}

type PartialResult<T> = (ExistingResult<T>|MissingResult)[];
type TempResult<T> = MissingResult|ExistingResult<T>|null;
interface ExistingResult<T> {
	start: number; end: number;
	results: T[];
}
interface MissingResult {
	start: number; end: number;
	results: undefined;
}
interface IPartialCollection<T, U> {
	maxCount?: number;
	get(index: number): T|null|undefined;
	fetch(range: IRange): Promise<T[]>;
	load(items: U[]): T[];
	unload(items: U[]): void;
	unloadRange(range: IRange): void;
	removeByIndex(index: number): void;
}

function isExistingResult<T>(value: any): value is ExistingResult<T> {
	if (!value) { return false; }
	return typeof value.start === 'number' &&
		typeof value.end === 'number' &&
		typeof value.results === 'object' && typeof value.results.map === 'function';
}
function isMissingResult(value?: any|null): value is MissingResult {
	if (!value) { return false; }
	return typeof value.start === 'number' &&
		typeof value.end === 'number' &&
		typeof value.results === 'undefined';
}
function finalizeTempResult<T>(tempResult: TempResult<T>, index: number): TempResult<T> {
	if (isExistingResult<T>(tempResult) || isMissingResult(tempResult)) {
		tempResult.end = index - 1;
	} else {
		tempResult = null;
	}
	return tempResult;
}

/**
 * Readonly
 */
export function PartialCollection<U extends object, T extends object = U>(options: IOptions<T, U>): IPartialCollection<T, U> {
	// indexed hash of items
	let internal: IMap<T> = { };
	let {
		indexer, maxCount, fetcher, identifier
	} = options;
	
	let _indexer = createIndexer(indexer);
	let _identifier = (function () {
		if (typeof identifier === 'string') {
			let prop = identifier;
			return (item: U) => (<any>item)[prop] as T;
		} else {
			return identifier || ((x: any) => x as T);
		}
	})();

	function throwIfUninitialized() {
		if (typeof maxCount !== 'number') {
			throw new Error('PartialCollection requires maxCount to be set to operate correctly.');
		}
	}
	function throwIfIndexerDNE(indices?: number[]) {
		if (!_indexer) {
			if (typeof indices !== 'object' && typeof indices!.map !== 'function') {
				throw new Error('In the absence of an indexer, PartialCollection.(un)load needs the indices array to be provided.');
			}
		}
	}

	function getSingle(index: number): T|null|undefined {
		throwIfUninitialized();
		// if index is out of bounds return undefined
		if (index >= maxCount! || index < 0) {
			return void 0;
		} else {
			// we currently assume we don't store nulls.
			// if index is within bounds, return the item, 
			// or if it's not loaded yet, return null.
			return internal['' + index] || null;
		}
	}

	function getMany(range: IRange): PartialResult<T> {
		throwIfUninitialized();
		let { skip, take } = asSkipTake(range);
		let count = Math.min(skip + take, maxCount!);
		let i;
		let results: PartialResult<T> = [];
		let tempResult: TempResult<T> = null;
		for (i = skip; i < count; ++i) {
			let item = internal['' + i];
			if (item) {
				if (isExistingResult<T>(tempResult)) {
					tempResult.results.push(item);
				} else {
					// if tempResult is not an ExistingResult, finalize previous tempResult
					// and declare new ExistingResult
					let r = finalizeTempResult<T>(tempResult, i);
					if (r) { results.push(r); }
					
					tempResult = {
						start: i, end: -1,
						results: [item]
					} as ExistingResult<T>;
				}
			} else {
				if (!isMissingResult(tempResult)) {
					// if tempResult is not a MissingResult
					let r = finalizeTempResult<T>(tempResult, i);
					if (r) { results.push(r); }

					tempResult = {
						start: i, end: -1
					} as MissingResult;
				}
			}
		}

		let r = finalizeTempResult<T>(tempResult, skip + take);
		if (r) { results.push(r); }

		return results;
	}

	function fillResultsGaps(partialResults: PartialResult<T>): Promise<T[]> {
		throwIfUninitialized();
		let i;
		let results: T[] = [];
		let promises: Promise<T[]>[] = partialResults.map(r => {
			if (isMissingResult(r)) {
				return fetcher(r).then(results => {
					return load(results);
				});
			} else {
				return Promise.resolve(r.results);
			}
		});

		return Promise.all(promises).then(results => {
			return flatMap(results);
		});
	}

	function load(items: U[]): T[] {
		throwIfUninitialized();
		let results: T[] = [];
		items.forEach((item, i) => {
			let index = _indexer(item);
			// Sanity check
			if (canBeInteger(index)) {
				if (index < maxCount!) { 
					let _item = _identifier(item);
					internal['' + index] = _item;
					results.push(_item);
				} else {
					// consider logging warnings here, for exceeding maxCount
				}
			} else {
				// consider logging warnings here, for not having an integer index
			}
		});
		return results;
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
		delete internal['' + index];
	}

	let proxy = {
		get: getSingle,
		fetch: (range: IRange) => {
			return fillResultsGaps(getMany(range));
		},
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
	return proxy as IPartialCollection<T, U>;
}


