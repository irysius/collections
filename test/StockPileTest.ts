import { expect } from 'chai';
import {
	Queue,
	Stack,
	PingPong
} from '../src/StockPile';

function createQueue() {
	let queue = Queue<number>();
	queue.add(1);
	queue.add(1);
	queue.add(2);
	queue.add(3);
	queue.add(5);
	queue.add(8);
	queue.add(13);
	return queue;
}

describe('StockPile-Queue', () => {
	describe('#constructor', () => {
		it('should be able to create an empty queue', () => {
			let queue = Queue();
			expect(queue.count).to.equal(0);
		});
		it('should be able to initialize the queue with some items', () => {
			let queue = Queue([1, 2, 3, 4, 5]);
			expect(queue.count).to.equal(5);
		});
	});
	describe('#add', () => {
		it('should be able to add items to the queue', () => {
			let queue = createQueue();
			expect(queue.count).to.equal(7);
		});
	});
	describe('#take', () => {
		it('should be able to take items from the queue correctly', () => {
			let queue = createQueue();
			expect(queue.take()).to.equal(1);
			expect(queue.take()).to.equal(1);
			expect(queue.take()).to.equal(2);
			expect(queue.take()).to.equal(3);
			expect(queue.take()).to.equal(5);
			expect(queue.take()).to.equal(8);
		});
		it("should return undefined if there's nothing in the queue", () => {
			let queue = Queue();
			expect(queue.take()).to.be.undefined;
		});
	});
	describe('#clear', () => {
		it('should correctly empty the queue when clear is called', () => {
			let queue = createQueue();
			expect(queue.count).to.equal(7);
			queue.clear();
			expect(queue.count).to.equal(0);
		});
	});
});

function createStack() {
	let stack = Stack<number>();
	stack.add(1);
	stack.add(1);
	stack.add(2);
	stack.add(3);
	stack.add(5);
	stack.add(8);
	stack.add(13);
	return stack;
}

describe('StockPile.Stack', () => {
	describe('#constructor', () => {
		it('should be able to create an empty stack', () => {
			let stack = Stack();
			expect(stack.count).to.equal(0);
		});
		it('should be able to initialize the stack with some items', () => {
			let stack = Stack([1, 2, 3, 4, 5]);
			expect(stack.count).to.equal(5);
		});
	});
	describe('#add', () => {
		it('should be able to add items to the stack', () => {
			let stack = createStack();
			expect(stack.count).to.equal(7);
		});
	});
	describe('#take', () => {
		it('should be able to take items from the stack correctly', () => {
			let stack = createStack();
			expect(stack.take()).to.equal(13);
			expect(stack.take()).to.equal(8);
			expect(stack.take()).to.equal(5);
			expect(stack.take()).to.equal(3);
			expect(stack.take()).to.equal(2);
			expect(stack.take()).to.equal(1);
		});
		it("should return undefined if there's nothing in the stack", () => {
			let stack = Stack();
			expect(stack.take()).to.be.undefined;
		});
	});
	describe('#clear', () => {
		it('should correctly empty the stack when clear is called', () => {
			let stack = createStack();
			expect(stack.count).to.equal(7);
			stack.clear();
			expect(stack.count).to.equal(0);
		});
	});
});

function createPingPong() {
	let pingPong = PingPong<number>();
	pingPong.add(1);
	pingPong.add(1);
	pingPong.add(2);
	pingPong.add(3);
	pingPong.add(5);
	pingPong.add(8);
	pingPong.add(13);
	return pingPong;
}

describe('StockPile.PingPong', () => {
	describe('#constructor', () => {
		it('should be able to create an empty pingpong', () => {
			let pingPong = PingPong();
			expect(pingPong.count).to.equal(0);
		});
		it('should be able to initialize the pingpong with some items', () => {
			let pingPong = PingPong([1, 2, 3, 4, 5]);
			expect(pingPong.count).to.equal(5);
			expect(pingPong.take()).to.equal(1);
			expect(pingPong.take()).to.equal(5);
			expect(pingPong.take()).to.equal(2);
		});
	});
	describe('#add', () => {
		it('should be able to add items to the pingpong', () => {
			let pingPong = createPingPong();
			expect(pingPong.count).to.equal(7);
		});
	});
	describe('#take', () => {
		it('should be able to take items from the pingpong correctly', () => {
			let pingPong = createPingPong();
			expect(pingPong.take()).to.equal(1);
			expect(pingPong.take()).to.equal(13);
			expect(pingPong.take()).to.equal(1);
			expect(pingPong.take()).to.equal(8);
			expect(pingPong.take()).to.equal(2);
			expect(pingPong.take()).to.equal(5);
		});
		it("should return undefined if there's nothing in the pingpong", () => {
			let pingPong = PingPong();
			expect(pingPong.take()).to.be.undefined;
		});
	});
	describe('#clear', () => {
		it('should correctly empty the pingpong when clear is called', () => {
			let pingPong = createPingPong();
			expect(pingPong.count).to.equal(7);
			pingPong.clear();
			expect(pingPong.count).to.equal(0);
		});
	});
});