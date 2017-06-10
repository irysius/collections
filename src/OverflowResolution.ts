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
	let count = Math.ceil(items.length / 2);
	return items.slice(count);
}
/**
 * Reduce the array size by dropping the latter half.
 */
export function dropLatterHalf<T>(items: T[]) {
	let count = Math.floor(items.length / 2);
	return items.slice(0, count);
}
/**
 * Reduce the array size by dropping half of the array from the middle.
 */
export function dropMiddle<T>(items: T[]) {
	if (items.length === 0) {}
	let q1 = Math.floor(items.length / 4);
	let q3 = Math.ceil(items.length / 4 * 3);
	let _q1 = items.slice(0, q1);
	let _q3 = items.slice(q3);
	return [..._q1, ..._q3];
}
/**
 * Reduces the array size by dropping X percent of the items in the array.
 */
export function dropRandom<T>(dropPercent: number, items: T[]) {
	if (items.length === 0) { return []; }
	if (dropPercent < 0) { throw new Error('dropRandom cannot accept a negative drop percentage.'); }
	let copy: (T|null)[] = items.slice();
	let dropCount = Math.round(items.length * dropPercent);
	let indices = rangeAsArray({ start: 0, end: items.length - 1 });
	let shuffled = shuffle(indices);
	let indicesToDrop = shuffled.slice(0, dropCount);
	indicesToDrop.forEach(i => {
		copy[i] = null;
	});
	return copy.filter(x => x != null) as T[];
}