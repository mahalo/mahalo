export default function isObject(obj) {
	return (typeof obj === 'object' || typeof obj === 'function') && obj !== null;
}