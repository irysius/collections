function noop() { }

// loop(thunks, cond, context);
type Nothing = undefined|null|void;
type Step<T, C = any> = (context?: C, index?: number) => Promise<T>|T|Nothing;
type Predicate<C = any> = (context?: C, index?: number) => boolean;

function StepEngine<T, C = any>(cond: Predicate<C>, context: C, results: T[]) {
	return function step(next: Step<T, C>, index: number) {
		return function step$(args?: T) {
			if (typeof args != 'undefined') {
				results.push(args);
			}
		
			return cond(context, index)
				? next(context, index)
				: undefined as any;
		}
	};
}
function finalStep<T>(results: T[]) {
	return function finalStep$(args?: T) {
		if (typeof args != 'undefined') {
			results.push(args);
		}
	}
}

export function pLoop<T, C = any>(steps: Step<T, C>[], cond: Predicate<C>, context: C): Promise<T[]> {
	let results: T[] = [];
	let promise: Promise<any> = Promise.resolve();
	let step = StepEngine<T, C>(cond, context, results);
	steps.forEach((next, i) => {
		promise = promise.then(step(next, i));
	});
	return promise
		.then(finalStep(results))
		.then(() => results);
}