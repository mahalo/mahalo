import * as types from './types';
import isObject from '../utils/is-object';

export default function compileBranch(branch: ExpressionBranch, ctx: Object) {
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

function compileFilter(branch: ExpressionBranch, ctx: Object) {
	return compileBranch(branch.arg, ctx);
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

function compileMember(branch: ExpressionBranch, ctx: Object) {
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