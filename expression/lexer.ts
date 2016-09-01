/**
 * This module contains the lexer for Mahalo expressions.
 */

/***/

import symbols from './symbols';

const whitespace = /\s/;
const sum = /[-+]/;
const multiply = /[*/%]/;
const negation = '!';
const member = '.';
const comparison = /[<>=]/;
const literal = /['"]/;
const identStart = /[a-z_$]/i;
const ident = /[\w_$]/;
const number = /\d/;
const lParenthesis = '(';
const rParenthesis = ')';
const lBracket = '[';
const rBracket = ']';
const lBrace = '{';
const rBrace = '}';
const colon = ':';
const comma = ',';
const filter = '|';

/**
 * This method should be called with a parser instance
 * as its context. It moves the parser forward one symbol
 * and assigns it to the parser's **symbol** property.
 */
export function nextSymbol() {
    let expression = this.expression;
    let char = expression[++this.i];
    
    while (char && whitespace.test(char)) {
        char = expression[++this.i];
    }
    
    let str = char;
    let start = this.i;
    let type;
    
    if (!char) {
        
        type = symbols.End;
        str = '';
        
    } else if (comparison.test(char)) {
        
        type = symbols.Comparison;
        
        if (expression[this.i + 1] === '=') {
            str += '=';
            this.i++;
        } else if (str === '=') {
            type = void 0;
        }
        
    } else if (literal.test(char)) {
        
        let mark = char;
        let esc;
    
        type = symbols.Literal;
        str = '';
        char = expression[++this.i];
        
        while (char && (char !== mark || esc)) {
            esc = char === '\\' && !esc;
            str += char;
            char = expression[++this.i];
        }
        
    } else if (number.test(char)) {
        
        type = symbols.Number;
        char = expression[++this.i];
        
        while (char && number.test(char)) {
            str += char;
            char = expression[++this.i];
        }
        
        if (char === '.') {
            str += char;
            char = expression[++this.i];
            
            while (char && number.test(char)) {
                str += char;
                char = expression[++this.i];
            }
        }
        
        this.i--;
        
    } else if (identStart.test(char)) {
        
        type = symbols.Identifier;
        char = expression[++this.i];
        
        while (char && ident.test(char)) {
            str += char;
            char = expression[++this.i];
        }
        
        this.i--;
    
    } else if (char === filter) {
        
        type = symbols.Filter;
    
    } else if (sum.test(char)) {
        
        type = symbols.Sum;
    
    } else if (multiply.test(char)) {
        
        type = symbols.Multiply;
    
    } else if (char === negation) {
        
        if (expression[this.i + 1] === '=') {
            type = symbols.Comparison;
            str += '=';
            this.i++;
        } else {
            type = symbols.Negation;
        }

    } else if (char === member) {
        
        type = symbols.Member;
    
    } else if (char === lParenthesis) {
        
        type = symbols.LParenthesis;
    
    } else if (char === rParenthesis) {
        
        type = symbols.RParenthesis;
    
    } else if (char === lBracket) {
            
        type = symbols.LBracket;
    
    } else if (char === rBracket) {
        
        type = symbols.RBracket;
    
    } else if (char === lBrace) {
        
        type = symbols.LBrace;
    
    } else if (char === rBrace) {
        
        type = symbols.RBrace;
    
    } else if (char === colon) {
        
        type = symbols.Colon;
        
    } else if (char === comma) {
        
        type = symbols.Comma;
    
    }
    
    if (!type) {
        throw Error('Unexpected character in column ' + this.i + ': ' + char);
    }
    
    this.symbol = {
        type: type,
        str: str,
        start: start
    };
}