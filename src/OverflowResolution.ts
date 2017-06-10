import { shuffle, rangeAsArray } from './Helpers';
export type OverflowResolver<T> = (items: T[]) => T[];

/**
 * Reduce the array size by removing the first item.
 */
export function removeStart<T>(items: T[]) {
	let copy = items.slice();
	copy.shift();
	return copy;
}
/**
 * Reduce the array size by removing the last item.
 */
export function removeEnd<T>(items: T[]) {
	let copy = items.slice();
	copy.pop();
	return copy;
}
/**
 * Reduce the array size by dropping the first half.
 */
export function dropFirstHalf<T>(items: T[]) {
	let count = Math.floor(items.length / 2);
	return items.slice(0, count);
}
/**
 * Reduce the array size by dropping the latter half.
 */
export function dropLatterHalf<T>(items: T[]) {
	let count = Math.ceil(items.length / 2);
	return items.slice(count);
}
/**
 * Reduce the array size by dropping half of the array from the middle.
 */
export function dropMiddleHalf<T>(items: T[]) {
	let count = Math.floor(items.length / 2);
	let start = Math.floor(items.length / 4);
	return items.slice(start, count);
}
/**
 * Reduces the array size by dropping X percent of the items in the array.
 */
export function dropRandom<T>(percent: number, items: T[]) {
	let copy: (T|null)[] = items.slice();
	let count = Math.round(items.length * percent);
	let indices = rangeAsArray({ start: 0, end: items.length - 1 });
	let shuffled = shuffle(indices);
	let indicesToDrop = shuffled.slice(0, count);
	indicesToDrop.forEach(i => {
		copy[i] = null;
	});
	return copy.filter(x => x != null) as T[];
}