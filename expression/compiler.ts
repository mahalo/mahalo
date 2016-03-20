import * as types from './types';
import filters from './filters';

export default function compileBranch(branch: ExpressionBranch, ctx: Object) {
	switch (branch.type) {
		case types.COMPARISON:
			return compileComparison(branch, ctx);
		
		case types.SUM:
			return compileSum(branch, ctx);
		
		case types.MULTIPLY:
			return compileMultiply(branch, ctx);
			
		case types.FILTER:
			return compileFilter(branch, ctx);
		
		case types.UNARY:
			return compileUnary(branch, ctx);
		
		case types.PAREN:
			return compileBranch(branch.content, ctx);
		
		case types.MEMBER:
			return compileMember(branch, ctx);
			
		case types.OBJECT:
			return compileObject(branch, ctx);
			
		case types.ARRAY:
			return compileArray(branch, ctx);
			
		case types.CALL:
			return compileCall(branch, ctx);
			
		case types.RESERVED:
			return compileReserved(branch, ctx);
		
		case types.LITERAL:
			return branch.str;
		
		case types.NUMBER:
			return parseFloat(branch.num);
		
		case types.IDENT:
			if (ctx instanceof Object) {
				return ctx[branch.name];
			}
		
		case types.BRACKET_IDENT:
			if (ctx instanceof Object) {
				return ctx[compileBranch(branch.prop, ctx)];
			}
	}
}

function compileComparison(branch: ExpressionBranch, ctx: Object) {
	var left = compileBranch(branch.left, ctx),
		right = compileBranch(branch.right, ctx);
		
	switch (branch.op) {
		case '=':
			return left == right;
			
		case '<=':
			return left <= right;
			
		case '>=':
			return left >= right;
			
		case '<>':
			return left != right;
			
		case '<':
			return left < right;
			
		case '>':
			return left > right;
	}
}

function compileSum(branch: ExpressionBranch, ctx: Object) {
	var left = compileBranch(branch.left, ctx),
		right = compileBranch(branch.right, ctx);
	
	if (branch.op === '+') {
		return left + right;
	}
	
	return left - right;
}

function compileMultiply(branch: ExpressionBranch, ctx: Object): number {
	var op = branch.op,
		left = compileBranch(branch.left, ctx),
		right = compileBranch(branch.right, ctx);
	
	if (op === '*') {
		return left * right;
	}
	
	if (op === '/') {
		return left / right;
	}
	
	return left % right;
}

function compileFilter(branch: ExpressionBranch, ctx: Object) {
	var filter = filters[branch.filter];
	
	if (typeof filter !== 'function') {
		throw Error('Missing filter ' + branch.filter);
	}
	
	var args = [compileBranch(branch.arg, ctx)],
		branches = branch.args,
		len = branches.length,
		i = 0;
	
	if (len) {
		while (i < len) {
			args.push(compileBranch(branches[i++], ctx));
		}
	}
	
	return filter.apply(null, args);
}

function compileUnary(branch: ExpressionBranch, ctx: Object): any {
	var op = branch.op,
		arg = compileBranch(branch.arg, ctx);
	
	if (op === '!') {
		return !arg;
	}
	
	if (op === '-') {
		return -arg;
	}
	
	return +arg;
}

function compileMember(branch: ExpressionBranch, ctx: Object, scope?: Object) {
	if (!(ctx instanceof Object)) {
		return;
	}
	
	var obj;
	
	if (branch.obj.type === types.IDENT) {
		
		obj = ctx[branch.obj.name];
		
	} else if (branch.obj.type === types.BRACKET_IDENT) {
		
		obj = ctx[compileBranch(branch.obj.prop, scope || ctx)];
		
	} else {
		
		obj = compileBranch(branch.obj, ctx);
		
	}
	
	if (!(obj instanceof Object)) {
		return;
	}
	
	var prop = branch.prop;
	
	if (prop.type === types.MEMBER) {
		return compileMember(prop, obj, scope);
	}
	
	if (prop.type === types.BRACKET_IDENT) {
		return obj[compileBranch(prop.prop, scope || ctx)];
	}
	
	if (prop.type === types.CALL) {
		return compileCall(prop, ctx, obj);
	}
	
	return obj[prop.name];
}

function compileObject(branch: ExpressionBranch, ctx: Object) {
	var obj = {},
		keys = branch.keys,
		key;
	
	for (key in keys) {
		if (keys.hasOwnProperty(key)) {
			obj[key] = compileBranch(keys[key], ctx);
		}
	}
	
	return obj;
}

function compileArray(branch: ExpressionBranch, ctx: Object) {
	var arr = [],
		items = branch.items,
		item = items[0],
		i = 0;
	
	while (item) {
		arr.push(compileBranch(item, ctx));
		
		item = items[++i];
	}
	
	return arr;
}

function compileCall(branch: ExpressionBranch, ctx: Object, obj: Object) {
	var method = compileBranch(branch.prop, ctx);
	
	if (typeof method !== 'function') {
		return;
	}
	
	var items = branch.args,
		item = items[0],
		i = 0,
		args = [];
	
	while (item) {
		args.push(compileBranch(item, ctx));
		item = items[++i];
	}
	
	return method.apply(obj, args);
}

function compileReserved(branch: ExpressionBranch, ctx: Object) {
	switch (branch.str) {
		case 'true':
			return true;
			
		case 'false':
			return false;
			
		case 'null':
			return null;
	}
}