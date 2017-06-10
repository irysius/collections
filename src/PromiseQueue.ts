import { 
	IStockPile, 
	IStockPileFactory, 
	Queue 
} from './StockPile';
import { PromiseThunk } from './Helpers';
interface IOptions {
	collectionType?: IStockPileFactory<any>;	
}


/**
 * Queue that is used to manage (long running) promises
 */
function PromiseQueue(options: IOptions = {}) {
	let {
		collectionType = Queue
	} = options;
	let thunks: IStockPile<PromiseThunk<any>> = collectionType();
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
			setTimeout(() => {
				current!().then(() => processNext(true));
			});
		}
	}
	function clear() {
		thunks.clear();
	}

	return {
		enqueue, clear
	};
}