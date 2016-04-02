// @todo: Remove if unused
var requestAnimationFrame = window.requestAnimationFrame || setTimeout,
	queue: Set<Function> = new Set();

export default function nextFrame(callback: Function, thisArg?) {
	if (!queue.size) {
		executeCallbacks();
	}
	
	queue.add(callback.bind(thisArg));
}

function executeCallbacks() {
	requestAnimationFrame(function() {
		var items = queue;
		
		queue = new Set();
		
		items.forEach(function(callback) {
			callback();
		});
	});
}