export default {
	lower: lower,
	upper: upper,
	camel: camel,
	date: date
}

function lower(value: string) {
	if (typeof value !== 'string') {
		return '';
	}
	
	return value.toUpperCase();
}

function upper(value: string) {
	if (typeof value !== 'string') {
		return '';
	}
	
	return value.toUpperCase();
}

function camel(value: string, first?: boolean) {
	if (typeof value !== 'string') {
		return '';
	}
	
	value = value.replace(/[-_]([a-z])/g, function(_, char) {
		return char.toUpperCase();
	});
	
	if (first) {
		value = value[0].toUpperCase() + value.substr(1);
	}
	
	return value;
}

function date(value) {
	var date = new Date(value);
	
	return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
}