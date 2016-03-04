var requestAnimationFrame = window.requestAnimationFrame || setTimeout,
	queue = new Set();

export default function nextFrame(callback, thisArg?) {
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