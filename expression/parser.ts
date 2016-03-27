import * as symbols from './symbols';
import * as types from './types';
import {nextSymbol} from './lexer';
import compileBranch from './compiler';
import {toKeyPath} from '../utils/key-path';

var RESERVED = ['true', 'false', 'null'],
	parsers = {};

export default class Parser {
	expression: string;
	
	i: number;
	
	paths: Set<string>;
	
	ast: ExpressionBranch;
	
	symbol: ExpressionSymbol;
	
	constructor(expression: string) {
		if (parsers.hasOwnProperty(expression)) {
			return parsers[expression];
		}
		
		this.expression = expression;
		this.i = -1;
		this.paths = new Set();
		this.ast = this.comparison();
		
		this.nextSymbol();
		this.expect(symbols.END);
		
		parsers[expression] = this;
	}
	
	comparison(): ExpressionBranch {
		var left = this.sum();
		
		if (this.accept(symbols.COMPARISON)) {
			return {
				type: types.COMPARISON,
				op: this.symbol.str,
				left: left,
				right: this.comparison()
			};
		}

		return left;
	}
	
	sum(): ExpressionBranch {
		var left = this.multiply();
		
		if (this.accept(symbols.SUM)) {
			return {
				type: types.SUM,
				op: this.symbol.str,
				left: left,
				right: this.sum()
			};
		}
		
		return left;
	}
	
	multiply(): ExpressionBranch {
		var left = this.filter();
		
		if (this.accept(symbols.MULTIPLY)) {
			return {
				type: types.MULTIPLY,
				op: this.symbol.str,
				left: left,
				right: this.multiply()
			};
		}
		
		return left;
	}
	
	filter(): ExpressionBranch {
		var arg = this.unary();
		
		if (!this.accept(symbols.FILTER)) {
			return arg;
		}
		
		var args = [],
			branch: ExpressionBranch = {
				type: types.FILTER,
				arg: arg,
				args: args
			};
		
		this.nextSymbol();
		this.expect(symbols.IDENT);
		
		branch.filter = this.symbol.str;
		
		if (this.accept(symbols.COLON)) {
			args.push(this.comparison());
			
			while(this.accept(symbols.COMMA)) {
				args.push(this.comparison());
			}
		}
		
		return branch;
	}
	
	unary(): ExpressionBranch {
		if (this.accept(symbols.SUM) || this.accept(symbols.NEGATION)) {
			return {
				type: types.UNARY,
				op: this.symbol.str,
				arg: this.paren()
			};
		}
		
		return this.paren();
	}
	
	paren(): ExpressionBranch {
		if (this.accept(symbols.LPAREN)) {
			var item = {
					type: types.PAREN,
					content: this.comparison()
				};
			
			this.nextSymbol();
			this.expect(symbols.RPAREN);
			
			return item;
		}
		
		return this.operand();
	}
	
	operand(): ExpressionBranch {
		if (this.accept(symbols.LITERAL)) {
			return {
				type: types.LITERAL,
				str: this.symbol.str
			};
		}
		
		if (this.accept(symbols.NUMBER)) {
			return {
				type: types.NUMBER,
				num: this.symbol.str
			};
		}
		
		return this.member();
	}
	
	member(): ExpressionBranch {
		var member;
		
		if (this.accept(symbols.LBRACE)) {
			
			member = {
				type: types.OBJECT,
				keys: this.object()
			}
			
		} else if (this.accept(symbols.LBRACKET)) {
			
			member = {
				type: types.ARRAY,
				items: this.array()
			}
			
		} else if (this.accept(symbols.MEMBER)) {
			
			this.nextSymbol();
			this.expect(symbols.LBRACKET);
			
			member = this.bracketIdentifier();
			
		} else {
			
			member = this.identifier();
			
		}
		
		member = this.memberOrIdentifier(member);
		
		if (member.type === types.IDENT && RESERVED.indexOf(member.name) > -1) {
			return {
				type: types.RESERVED,
				str: member.name
			}
		}
		
		this.addPath(member);
		
		return member;
	}
	
	object() {
		var keys = {},
			next = true,
			desc = this.key();
		
		while (desc) {
			keys[desc.key] = desc.value;
			
			if (this.accept(symbols.COMMA)) {
				desc = this.key();
				desc || this.expect(symbols.RBRACE);
			} else {
				desc = null;
			}
		}
		
		this.nextSymbol();
		this.expect(symbols.RBRACE);
		
		return keys;
	}
	
	key() {
		if (this.accept(symbols.LITERAL) || this.accept(symbols.NUMBER) || this.accept(symbols.IDENT)) {
			return {
				key: this.symbol.str,
				value: this.nextSymbol() || this.expect(symbols.COLON) || this.comparison()
			};
		}
	}
	
	array() {
		if (this.accept(symbols.RBRACKET)) {
			return [];
		}
		
		var items = [this.comparison()];
		
		while (this.accept(symbols.COMMA)) {
			items.push(this.comparison());
		}
		
		this.nextSymbol();
		this.expect(symbols.RBRACKET);
		
		return items;
	}
	
	memberOrIdentifier(ident): ExpressionBranch {
		if (ident.type !== types.OBJECT && ident.type !== types.ARRAY && this.accept(symbols.LPAREN)) {
			ident = this.call(ident);
		}
		
		if (this.accept(symbols.LBRACKET)) {
			return {
				type: types.MEMBER,
				obj: ident,
				prop: this.memberOrIdentifier(this.bracketIdentifier())
			}
		}
		
		if (this.accept(symbols.MEMBER)) {
			return {
				type: types.MEMBER,
				obj: ident,
				prop: this.memberOrIdentifier(this.identifier())
			};
		}
		
		return ident;
	}
	
	call(member): ExpressionBranch {
		var args = [];
		
		this.paths = null;
		
		if (!this.accept(symbols.RPAREN)) {
			args.push(this.comparison());
			
			while (this.accept(symbols.COMMA)) {
				args.push(this.comparison());
			}
			
			this.nextSymbol();
			this.expect(symbols.RPAREN);
		}
		
		return {
			type: types.CALL,
			prop: member,
			args: args
		}
	}
	
	bracketIdentifier(): ExpressionBranch {
		var prop = this.comparison();
		
		this.nextSymbol();
		this.expect(symbols.RBRACKET);
		
		return {
			type: types.BRACKET_IDENT,
			prop: prop
		};
	}
	
	identifier(): ExpressionBranch {
		this.nextSymbol();
		this.expect(symbols.IDENT);
		
		return {
			type: types.IDENT,
			name: this.symbol.str
		};
	}
	
	expect(type: number) {
		if (this.symbol.type !== type) {
			throw Error('Unexpected symbol in column ' + this.symbol.start);
		}
	}
	
	accept(type: number) {
		this.nextSymbol();
		
		if (this.symbol.type === type) {
			return true;
		}
		
		this.i = this.symbol.start - 1;
		
		return false;
	}
	
	nextSymbol() {
		nextSymbol.call(this);
	}
	
	addPath(branch: ExpressionBranch, path?: string) {
		if (!this.paths) {
			return;
		}
		
		path = path ? path + '.' : '';
		
		if (branch.type === types.MEMBER) {
			path = this.resolvePath(branch.obj, path);
			path && this.addPath(branch.prop, path);
			
			return;
		}
		
		path = this.resolvePath(branch, path);
		path && this.paths.add(path);
	}
	
	resolvePath(branch, path) {
		if (branch.type === types.IDENT) {
			return path + branch.name;
		}
		
		if (isBracketIdentifier(branch)) {
			var prop = branch.prop;
			
			return path + toKeyPath(prop.str || prop.num);
		}
		
		if (branch.type === types.BRACKET_IDENT) {
			this.paths = null;
		}
	}
	
	compile(scope: Object) {
		return compileBranch(this.ast, scope);
	}
}

function isBracketIdentifier(branch) {
	return branch.type === types.BRACKET_IDENT && (branch.prop.type === types.LITERAL || branch.prop.type === types.NUMBER);
}