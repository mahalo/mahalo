/**
 * This module contains the expression parser.
 */

/***/

import symbols from './symbols';
import types from './types';
import {nextSymbol} from './lexer';
import compileBranch from './compiler';
import {toKeyPath} from '../utils/key-path';

const reserved = ['true', 'false', 'null'];
const parsers = {};

/**
 * A simple parser for Mahalo expressions.
 */
export default class Parser {
    /**
     * The expression string.
     */
    expression: string;
    
    /**
     * The current character index.
     */
    i: number;
    
    /**
     * A set of key paths that are used in
     * the expression.
     */
    paths: Set<string>;
    
    /**
     * The AST for the expression string.
     */
    ast: IExpressionBranch;
    
    /**
     * The current symbol.
     */
    symbol: {
        type: types   
        str: string
        start: number
    };
    
    constructor(expression: string) {
        if (parsers.hasOwnProperty(expression)) {
            return parsers[expression];
        }
        
        this.expression = expression;
        this.i = -1;
        this.paths = new Set();
        this.ast = this.filter();
        
        this.nextSymbol();
        this.expect(symbols.End);
        
        parsers[expression] = this;
    }
    
    /**
     * Compiles the AST with a given scope.
     */
    compile(scope: Object) {
        return compileBranch(this.ast, scope);
    }
    
    
    //////////
    
    
    private filter(): IExpressionBranch {
        let arg = this.comparison();
        
        if (!this.accept(symbols.Filter)) {
            return arg;
        }
        
        let args = [];
        let branch: IExpressionBranch = {
            type: types.Filter,
            arg: arg,
            args: args
        };
        
        this.nextSymbol();
        this.expect(symbols.Identifier);
        
        branch.filter = this.symbol.str;
        
        if (this.accept(symbols.Colon)) {
            args.push(this.filter());
            
            while(this.accept(symbols.Comma)) {
                args.push(this.filter());
            }
        }
        
        return branch;
    }
    
    private comparison(): IExpressionBranch {
        let left = this.sum();
        
        if (this.accept(symbols.Comparison)) {
            return {
                type: types.Comparison,
                op: this.symbol.str,
                left: left,
                right: this.filter()
            };
        }

        return left;
    }
    
    private sum(): IExpressionBranch {
        let left = this.multiply();
        
        if (this.accept(symbols.Sum)) {
            return {
                type: types.Sum,
                op: this.symbol.str,
                left: left,
                right: this.sum()
            };
        }
        
        return left;
    }
    
    private multiply(): IExpressionBranch {
        let left = this.unary();
        
        if (this.accept(symbols.Multiply)) {
            return {
                type: types.Multiply,
                op: this.symbol.str,
                left: left,
                right: this.multiply()
            };
        }
        
        return left;
    }
    
    private unary(): IExpressionBranch {
        if (this.accept(symbols.Sum) || this.accept(symbols.Negation)) {
            return {
                type: types.Unary,
                op: this.symbol.str,
                arg: this.paren()
            };
        }
        
        return this.paren();
    }
    
    private paren(): IExpressionBranch {
        if (this.accept(symbols.LParenthesis)) {
            let item = {
                type: types.Parenthesis,
                content: this.filter()
            };
            
            this.nextSymbol();
            this.expect(symbols.RParenthesis);
            
            return item;
        }
        
        return this.operand();
    }
    
    private operand(): IExpressionBranch {
        if (this.accept(symbols.Literal)) {
            return {
                type: types.Literal,
                str: this.symbol.str
            };
        }
        
        if (this.accept(symbols.Number)) {
            return {
                type: types.Number,
                num: this.symbol.str
            };
        }
        
        return this.member();
    }
    
    private member(): IExpressionBranch {
        let member;
        
        if (this.accept(symbols.LBrace)) {
            
            member = {
                type: types.Object,
                keys: this.object()
            }
            
        } else if (this.accept(symbols.LBracket)) {
            
            member = {
                type: types.Array,
                items: this.array()
            }
            
        } else if (this.accept(symbols.Member)) {
            
            this.nextSymbol();
            this.expect(symbols.LBracket);
            
            member = this.bracketIdentifier();
            
        } else {
            
            member = this.identifier();
            
        }
        
        member = this.memberOrIdentifier(member);
        
        if (member.type === types.Identifier && reserved.indexOf(member.name) > -1) {
            return {
                type: types.Reserved,
                str: member.name
            }
        }
        
        this.addPath(member);
        
        return member;
    }
    
    private object() {
        let keys = {};
        let desc = this.key();
        
        while (desc) {
            keys[desc.key] = desc.value;
            
            if (this.accept(symbols.Comma)) {
                desc = this.key();
                desc || this.expect(symbols.RBrace);
            } else {
                desc = null;
            }
        }
        
        this.nextSymbol();
        this.expect(symbols.RBrace);
        
        return keys;
    }
    
    private key() {
        if (this.accept(symbols.Literal) || this.accept(symbols.Number) || this.accept(symbols.Identifier)) {
            return {
                key: this.symbol.str,
                value: this.nextSymbol() || this.expect(symbols.Colon) || this.filter()
            };
        }
    }
    
    private array() {
        if (this.accept(symbols.RBracket)) {
            return [];
        }
        
        let items = [this.filter()];
        
        while (this.accept(symbols.Comma)) {
            items.push(this.filter());
        }
        
        this.nextSymbol();
        this.expect(symbols.RBracket);
        
        return items;
    }
    
    private memberOrIdentifier(ident): IExpressionBranch {
        if (ident.type !== types.Object && ident.type !== types.Array && this.accept(symbols.LParenthesis)) {
            ident = this.call(ident);
        }
        
        if (this.accept(symbols.LBracket)) {
            return {
                type: types.Member,
                obj: ident,
                prop: this.memberOrIdentifier(this.bracketIdentifier())
            }
        }
        
        if (this.accept(symbols.Member)) {
            return {
                type: types.Member,
                obj: ident,
                prop: this.memberOrIdentifier(this.identifier())
            };
        }
        
        return ident;
    }
    
    private call(member): IExpressionBranch {
        let args = [];
        
        this.paths = null;
        
        if (!this.accept(symbols.RParenthesis)) {
            args.push(this.filter());
            
            while (this.accept(symbols.Comma)) {
                args.push(this.filter());
            }
            
            this.nextSymbol();
            this.expect(symbols.RParenthesis);
        }
        
        return {
            type: types.Call,
            prop: member,
            args: args
        }
    }
    
    private bracketIdentifier(): IExpressionBranch {
        let prop = this.filter();
        
        this.nextSymbol();
        this.expect(symbols.RBracket);
        
        return {
            type: types.BracketIdentifier,
            prop: prop
        };
    }
    
    private identifier(): IExpressionBranch {
        this.nextSymbol();
        this.expect(symbols.Identifier);
        
        return {
            type: types.Identifier,
            name: this.symbol.str
        };
    }
    
    private expect(type: number) {
        if (this.symbol.type !== type) {
            throw Error('Unexpected symbol in column ' + this.symbol.start);
        }
    }
    
    private accept(type: number) {
        this.nextSymbol();
        
        if (this.symbol.type === type) {
            return true;
        }
        
        this.i = this.symbol.start - 1;
        
        return false;
    }
    
    private nextSymbol() {
        nextSymbol.call(this);
    }
    
    private isBracketIdentifier(branch) {
        return branch.type === types.BracketIdentifier && (branch.prop.type === types.Literal || branch.prop.type === types.Number);
    }
    
    private addPath(branch: IExpressionBranch, path?: string) {
        if (!this.paths) {
            return;
        }
        
        path = path ? path + '.' : '';
        
        if (branch.type === types.Member) {
            path = this.resolvePath(branch.obj, path);
            path && this.addPath(branch.prop, path);
            
            return;
        }
        
        path = this.resolvePath(branch, path);
        path && this.paths.add(path);
    }
    
    private resolvePath(branch, path) {
        if (branch.type === types.Identifier) {
            return path + branch.name;
        }
        
        if (this.isBracketIdentifier(branch)) {
            let prop = branch.prop;
            
            return path + toKeyPath(prop.str || prop.num);
        }
        
        if (branch.type === types.BracketIdentifier) {
            this.paths = null;
        }
    }
}

export interface IExpressionBranch {
    type: number;
    
    name?: string;
    
    arg?: IExpressionBranch;
    
    filter?: string;
    
    prop?: IExpressionBranch;
    
    obj?: IExpressionBranch;
    
    op?: string;
    
    left?: IExpressionBranch;
    
    right?: IExpressionBranch;
    
    str?: string;
    
    content?: IExpressionBranch;
    
    num?: string;
    
    keys?: Object;
    
    items?: any[];
    
    args?: IExpressionBranch[];
}