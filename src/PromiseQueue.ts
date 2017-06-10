import { 
	IStockPile, 
	IStockPileFactory, 
	Queue 
} from './StockPile';
import { PromiseThunk } from './Helpers';
interface IOptions {
	collection?: IStockPile<PromiseThunk<any>>;	
}

/**
 * Queue that is used to manage (long running) promises
 */
export function PromiseQueue(options: IOptions = {}) {
	let {
		collection: thunks = Queue<PromiseThunk<any>>()
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
			thunk!()
			.catch(ignore)
			.then(() => processNext(true));
		}, 0);
	}
	function clear() {
		thunks.clear();
	}

	return {
		enqueue, clear
	};
}