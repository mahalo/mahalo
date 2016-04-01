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
		this.ast = this._comparison();
		
		this._nextSymbol();
		this._expect(symbols.END);
		
		parsers[expression] = this;
	}
	
	compile(scope: Object) {
		return compileBranch(this.ast, scope);
	}
	
	_comparison(): ExpressionBranch {
		var left = this._sum();
		
		if (this._accept(symbols.COMPARISON)) {
			return {
				type: types.COMPARISON,
				op: this.symbol.str,
				left: left,
				right: this._comparison()
			};
		}

		return left;
	}
	
	_sum(): ExpressionBranch {
		var left = this._multiply();
		
		if (this._accept(symbols.SUM)) {
			return {
				type: types.SUM,
				op: this.symbol.str,
				left: left,
				right: this._sum()
			};
		}
		
		return left;
	}
	
	_multiply(): ExpressionBranch {
		var left = this._filter();
		
		if (this._accept(symbols.MULTIPLY)) {
			return {
				type: types.MULTIPLY,
				op: this.symbol.str,
				left: left,
				right: this._multiply()
			};
		}
		
		return left;
	}
	
	_filter(): ExpressionBranch {
		var arg = this._unary();
		
		if (!this._accept(symbols.FILTER)) {
			return arg;
		}
		
		var args = [],
			branch: ExpressionBranch = {
				type: types.FILTER,
				arg: arg,
				args: args
			};
		
		this._nextSymbol();
		this._expect(symbols.IDENT);
		
		branch.filter = this.symbol.str;
		
		if (this._accept(symbols.COLON)) {
			args.push(this._comparison());
			
			while(this._accept(symbols.COMMA)) {
				args.push(this._comparison());
			}
		}
		
		return branch;
	}
	
	_unary(): ExpressionBranch {
		if (this._accept(symbols.SUM) || this._accept(symbols.NEGATION)) {
			return {
				type: types.UNARY,
				op: this.symbol.str,
				arg: this._paren()
			};
		}
		
		return this._paren();
	}
	
	_paren(): ExpressionBranch {
		if (this._accept(symbols.LPAREN)) {
			var item = {
					type: types.PAREN,
					content: this._comparison()
				};
			
			this._nextSymbol();
			this._expect(symbols.RPAREN);
			
			return item;
		}
		
		return this._operand();
	}
	
	_operand(): ExpressionBranch {
		if (this._accept(symbols.LITERAL)) {
			return {
				type: types.LITERAL,
				str: this.symbol.str
			};
		}
		
		if (this._accept(symbols.NUMBER)) {
			return {
				type: types.NUMBER,
				num: this.symbol.str
			};
		}
		
		return this._member();
	}
	
	_member(): ExpressionBranch {
		var member;
		
		if (this._accept(symbols.LBRACE)) {
			
			member = {
				type: types.OBJECT,
				keys: this._object()
			}
			
		} else if (this._accept(symbols.LBRACKET)) {
			
			member = {
				type: types.ARRAY,
				items: this._array()
			}
			
		} else if (this._accept(symbols.MEMBER)) {
			
			this._nextSymbol();
			this._expect(symbols.LBRACKET);
			
			member = this._bracketIdentifier();
			
		} else {
			
			member = this._identifier();
			
		}
		
		member = this._memberOrIdentifier(member);
		
		if (member.type === types.IDENT && RESERVED.indexOf(member.name) > -1) {
			return {
				type: types.RESERVED,
				str: member.name
			}
		}
		
		this._addPath(member);
		
		return member;
	}
	
	_object() {
		var keys = {},
			next = true,
			desc = this._key();
		
		while (desc) {
			keys[desc.key] = desc.value;
			
			if (this._accept(symbols.COMMA)) {
				desc = this._key();
				desc || this._expect(symbols.RBRACE);
			} else {
				desc = null;
			}
		}
		
		this._nextSymbol();
		this._expect(symbols.RBRACE);
		
		return keys;
	}
	
	_key() {
		if (this._accept(symbols.LITERAL) || this._accept(symbols.NUMBER) || this._accept(symbols.IDENT)) {
			return {
				key: this.symbol.str,
				value: this._nextSymbol() || this._expect(symbols.COLON) || this._comparison()
			};
		}
	}
	
	_array() {
		if (this._accept(symbols.RBRACKET)) {
			return [];
		}
		
		var items = [this._comparison()];
		
		while (this._accept(symbols.COMMA)) {
			items.push(this._comparison());
		}
		
		this._nextSymbol();
		this._expect(symbols.RBRACKET);
		
		return items;
	}
	
	_memberOrIdentifier(ident): ExpressionBranch {
		if (ident.type !== types.OBJECT && ident.type !== types.ARRAY && this._accept(symbols.LPAREN)) {
			ident = this._call(ident);
		}
		
		if (this._accept(symbols.LBRACKET)) {
			return {
				type: types.MEMBER,
				obj: ident,
				prop: this._memberOrIdentifier(this._bracketIdentifier())
			}
		}
		
		if (this._accept(symbols.MEMBER)) {
			return {
				type: types.MEMBER,
				obj: ident,
				prop: this._memberOrIdentifier(this._identifier())
			};
		}
		
		return ident;
	}
	
	_call(member): ExpressionBranch {
		var args = [];
		
		this.paths = null;
		
		if (!this._accept(symbols.RPAREN)) {
			args.push(this._comparison());
			
			while (this._accept(symbols.COMMA)) {
				args.push(this._comparison());
			}
			
			this._nextSymbol();
			this._expect(symbols.RPAREN);
		}
		
		return {
			type: types.CALL,
			prop: member,
			args: args
		}
	}
	
	_bracketIdentifier(): ExpressionBranch {
		var prop = this._comparison();
		
		this._nextSymbol();
		this._expect(symbols.RBRACKET);
		
		return {
			type: types.BRACKET_IDENT,
			prop: prop
		};
	}
	
	_identifier(): ExpressionBranch {
		this._nextSymbol();
		this._expect(symbols.IDENT);
		
		return {
			type: types.IDENT,
			name: this.symbol.str
		};
	}
	
	_expect(type: number) {
		if (this.symbol.type !== type) {
			throw Error('Unexpected symbol in column ' + this.symbol.start);
		}
	}
	
	_accept(type: number) {
		this._nextSymbol();
		
		if (this.symbol.type === type) {
			return true;
		}
		
		this.i = this.symbol.start - 1;
		
		return false;
	}
	
	_nextSymbol() {
		nextSymbol.call(this);
	}
	
	_addPath(branch: ExpressionBranch, path?: string) {
		if (!this.paths) {
			return;
		}
		
		path = path ? path + '.' : '';
		
		if (branch.type === types.MEMBER) {
			path = this._resolvePath(branch.obj, path);
			path && this._addPath(branch.prop, path);
			
			return;
		}
		
		path = this._resolvePath(branch, path);
		path && this.paths.add(path);
	}
	
	_resolvePath(branch, path) {
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
}

function isBracketIdentifier(branch) {
	return branch.type === types.BRACKET_IDENT && (branch.prop.type === types.LITERAL || branch.prop.type === types.NUMBER);
}