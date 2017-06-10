export interface IMap<T> {
	[key: string]: T;
}
export type Mapper<T, U> = (item: T) => U;
export type PromiseThunk<T> = () => Promise<T>;
export interface IRange {
	start: number; end: number;
}
export function asSkipTake(range: IRange) {
	if (range.end < range.start) { throw new Error('An invalid range has been passed to asSkipTake.'); }
	return {
		skip: range.start,
		take: range.end - range.start + 1
	};
}
export function canBeInteger(value: any): boolean {
	if (typeof value === 'string') {
		let integer = parseInt(value, 10);
		return '' + integer === value;
	} else if (typeof value === 'number') {
		return Math.floor(value) === value;
	} else {
		return false;
	}
}
export function flatMap<T>(items: T[][]): T[] {
	let i, j;
	let results: T[] = [];
	for (i = 0; i < items.length; ++i) {
		let item = items[i];
		for (j = 0; j < item.length; ++j) {
			results.push(item[j]);
		}
	}
	return results;
}
interface ICreateRangesOptions {
	maxGapSize?: number;
}
export function createRanges(indices: number[], options: ICreateRangesOptions = {}): IRange[] {
	let {
		maxGapSize = 0
	} = options;
	if (maxGapSize < 0) { throw new Error('Cannot createRanges with a negative maxGapSize.'); }
	
	return [];
}
export function createIndexer<U>(indexer: string|Mapper<U, number>): Mapper<U, number> {
	if (typeof indexer === 'string') {
		if (!indexer) { throw new Error('Attempted to create an indexer from an empty string'); }
		let prop = indexer;
		return (item: U) => (<any>item)[prop] as number;
	} else {
		return indexer;
	}
}
export function coalesceNumber(value: number|undefined, defaultValue: number): number {
	if (typeof value === 'number') {
		return value;
	} else {
		return defaultValue;
	}
}
export function shuffle<T>(items: T[]): T[] {
	let copy = items.slice();
	// Durstenfeld shuffle
	for (let i = copy.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		let temp = copy[i];
		copy[i] = copy[j];
		copy[j] = temp;
	}
	return copy;
}
export function rangeAsArray(range: IRange): number[] {
	if (range.end < range.start) { throw new Error('An invalid range has been passed to rangeAsArray.'); }
	let { skip, take } = asSkipTake(range);
	let results = [];
	let i;
	for (i = skip; i < skip + take; ++i) {
		results.push(i);
	}
	return results;
}
/**
 * Returns a promise that resolves after waiting for the specified timeout
 */
export function wait(timeout: number) {
	return new Promise<void>((resolve) => {
		setTimeout(() => {
			resolve();
		}, timeout);
	});
}
/**
 * Returns a promise to timeout with the specified error message
 */
export function timeout(timeout: number, errorMessage: string) {
	return new Promise<void>((_, reject) => {
		setTimeout(() => {
			reject(new Error(errorMessage));
		}, timeout);
	});
}