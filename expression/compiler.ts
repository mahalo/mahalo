import * as types from './types';

export default function compileBranch(branch, ctx) {
	switch (branch.type) {
		case types.FILTER:
			return compileFilter(branch, ctx);
		
		case types.COMPARISON:
			return compileComparison(branch, ctx);
		
		case types.SUM:
			return compileSum(branch, ctx);
		
		case types.MULTIPLY:
			return compileMultiply(branch, ctx);
		
		case types.UNARY:
			return compileUnary(branch, ctx);
		
		case types.PAREN:
			return compileBranch(branch.content, ctx);
		
		case types.MEMBER:
			return compileMember(branch, ctx);
		
		case types.LITERAL:
			return branch.str;
		
		case types.NUMBER:
			return parseFloat(branch.num);
		
		case types.IDENT:
			return isObject(ctx) && typeof ctx[branch.name] !== 'undefined' ? ctx[branch.name] : '';
	}
}

function compileFilter(branch, ctx) {
	return compileBranch(branch.arg, ctx);
}

function compileComparison(branch, ctx) {
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
	}
}

function compileSum(branch, ctx) {
	var left = compileBranch(branch.left, ctx),
		right = compileBranch(branch.right, ctx);
	
	if (branch.op === '+') {
		return left + right;
	}
	
	return left - right;
}

function compileMultiply(branch, ctx): number {
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

function compileUnary(branch, ctx): any {
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

function compileMember(branch, ctx) {
	if (!isObject(ctx)) {
		return;
	}
	
	var obj = ctx[branch.obj.name];
	
	if (!isObject(obj)) {
		return;
	}
	
	var prop = branch.prop;
	
	if (prop.type === types.MEMBER) {
		return compileMember(prop, obj);
	}
	
	return obj[prop.name];
}

function isObject(obj) {
	return (typeof obj === 'object' || typeof obj === 'function') && obj !== null;
}