import * as symbols from './symbols';
import * as types from './types';
import {Symbol, nextSymbol} from './lexer';
import compileBranch from './compiler';
import {watch, unwatch} from '../change-detection/watch';

var expressions = {};

export default class Expression {
	exp: string
	
	i: number
	
	paths: Set<string>
	
	ast: Object
	
	symbol: Symbol
	
	constructor(exp: string) {
		if (expressions[exp]) {
			return expressions[exp];
		}
		
		this.exp = exp;
		this.i = -1;
		this.paths = new Set();
		this.ast = this.expression();
		
		this.nextSymbol();
		this.expect('END');
		
		expressions[exp] = this;
	}
	
	expression() {
		if (this.accept(symbols.LPAREN)) {
			this.i = this.symbol.start - 1;
			return this.paren();
		}
		
		return this.comparison();
	}
	
	filter() {
		var arg = this.comparison();
		
		if (this.accept(symbols.FILTER)) {
			this.nextSymbol();
			this.expect(symbols.IDENT);
			
			return {
				type: types.FILTER,
				arg: arg,
				filter: this.symbol.str
			}
		}
		
		return arg;
	}
	
	comparison() {
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
	
	sum() {
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
	
	multiply() {
		var left = this.unary();
		
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
	
	unary() {
		if (this.accept(symbols.SUM) || this.accept(symbols.NEGATION)) {
			return {
				type: types.UNARY,
				op: this.symbol.str,
				arg: this.paren()
			};
		}
		
		return this.paren();
	}
	
	paren() {
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
	
	operand() : Object {
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
		
		var member = this.member();
		
		if (member.type === types.MEMBER) {
			this.addPath(member);
		} else {
			this.paths.add(member.name);
		}
		
		return member;
	}
	
	member() {
		var ident;
		
		if (this.accept(symbols.LBRACKET)) {
			ident = this.bracket();
		} else {
			ident = this.identifier();
		}
		
		if (this.accept(symbols.MEMBER)) {
			if (this.accept(symbols.LBRACKET)) {
				throw Error('Unexpected symbol in column ' + this.symbol.start);
			}
			
			return {
				type: types.MEMBER,
				obj: ident,
				prop: this.member()
			};
		}
		
		if (this.accept(symbols.LBRACKET)) {
			this.i--;
			
			return {
				type: types.MEMBER,
				obj: ident,
				prop: this.member()
			}
		}
		
		return ident;
	}
	
	bracket() {
		var ident;
		
		if (!this.accept(symbols.LITERAL)) {
			this.nextSymbol();
			this.expect(symbols.NUMBER);
		}
		
		ident = {
			type: types.IDENT,
			name: this.symbol.str
		};
		
		this.nextSymbol();
		this.expect(symbols.RBRACKET);
		
		return ident;
	}
	
	identifier() {
		this.nextSymbol();
		this.expect(symbols.IDENT);
		
		return {
			type: types.IDENT,
			name: this.symbol.str
		};
	}
	
	expect(type) {
		if (this.symbol.type !== type) {
			throw Error('Unexpected symbol in column ' + this.symbol.start);
		}
	}
	
	accept(type) {
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
	
	addPath(branch, path?) {
		path = (path ? path + '.' : '') + branch.obj.name;
		
		var prop = branch.prop;
		
		if (prop.type === types.MEMBER) {
			return this.addPath(prop, path);
		}
		
		this.paths.add(path + '.' + prop.name);
	}
	
	watch(scope, callback) {
		if (typeof callback === 'function') {
			
			this.paths.forEach(function (path) {
				watch(scope, path, callback);
			});
		}
		
		return this.compile(scope);
	}
	
	unwatch(scope, callback?) {
		this.paths.forEach(function (path) {
			unwatch(scope, path, callback);
		});
	}
	
	compile(scope) {
		return compileBranch(this.ast, scope);
	}
}