import { 
	IStockPile, 
	IStockPileFactory, 
	Queue 
} from './StockPile';
import { PromiseThunk, timeout } from './Helpers';
interface IOptions {
	collection?: IStockPile<PromiseThunk<any>>;	
	timeout?: number;
}

/**
 * Queue that is used to manage (long running) promises
 */
export function PromiseQueue(options: IOptions = {}) {
	let {
		collection: thunks = Queue<PromiseThunk<any>>(),
		timeout: _timeout
	} = options;
	let current: PromiseThunk<any>|null = null;

	function enqueue(thunk: PromiseThunk<any>) {
		thunks.add(thunk);
		processNext();
	}
	function processNext(fromInternal?: boolean) {
		if (thunks.count === 0) {
			current = null;
		} else if (fromInternal || !current) {
			// only continue if there's nothing currently running.
			// or continue if we are currently processing a queue.
			current = thunks.take()!;
			tick(current);
		}
	}
	function tick(thunk: PromiseThunk<any>) {
		let ignore = () => {};
		setTimeout(() => {
			executeThunk(thunk)
			.catch(ignore)
			.then(() => processNext(true));
		}, 0);
	}
	function executeThunk(thunk: PromiseThunk<any>) {
		if (typeof _timeout !== 'number') {
			return thunk();
		} else {
			return Promise.race([
				thunk(),
				timeout(_timeout, 'PromiseQueue had to timeout an ongoing promise.')
			]);
		}
	}

	function clear() {
		thunks.clear();
	}

	return {
		enqueue, clear
	};
}