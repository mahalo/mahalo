// @todo: Add more built-in filters
export default {
    lower: lower,
    upper: upper,
    camel: camel,
    date: date,
    escape: escape
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

// @todo: Refactor to return correct date format
function date(value) {
    var date = new Date(value);
    
    return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
}

// @todo: Implement escape filter
function escape(value) {
    return value;
}