/**
 * This module contains the lexer for Mahalo expressions.
 */

/***/

import * as symbols from './symbols';

/**
 * This method should be called with a parser instance
 * as its context. It moves the parser forward one symbol
 * and assigns it to the parser's **symbol** property.
 */
export function nextSymbol() {
    var expression = this.expression,
        char = expression[++this.i],
        type,
        str,
        start;
    
    while (char && WHITESPACE.test(char)) {
        char = expression[++this.i];
    }
    
    str = char;
    start = this.i;
    
    if (!char) {
        
        type = symbols.END;
        str = '';
        
    } else if (COMPARISON.test(char)) {
        
        type = symbols.COMPARISON;
        
        if (expression[this.i + 1] === '=') {
            str += '=';
            this.i++;
        } else if (str === '=') {
            type = void 0;
        }
        
    } else if (LITERAL.test(char)) {
        
        var mark = char,
            esc;
    
        type = symbols.LITERAL;
        str = '';
        char = expression[++this.i];
        
        while (char && (char !== mark || esc)) {
            esc = char === '\\' && !esc;
            str += char;
            char = expression[++this.i];
        }
        
    } else if (NUMBER.test(char)) {
        
        type = symbols.NUMBER;
        char = expression[++this.i];
        
        while (char && NUMBER.test(char)) {
            str += char;
            char = expression[++this.i];
        }
        
        if (char === '.') {
            str += char;
            char = expression[++this.i];
            
            while (char && NUMBER.test(char)) {
                str += char;
                char = expression[++this.i];
            }
        }
        
        this.i--;
        
    } else if (IDENT_START.test(char)) {
        
        type = symbols.IDENT;
        char = expression[++this.i];
        
        while (char && IDENT.test(char)) {
            str += char;
            char = expression[++this.i];
        }
        
        this.i--;
    
    } else if (char === FILTER) {
        
        type = symbols.FILTER;
    
    } else if (SUM.test(char)) {
        
        type = symbols.SUM;
    
    } else if (MULTIPLY.test(char)) {
        
        type = symbols.MULTIPLY;
    
    } else if (char === NEGATION) {
        
        if (expression[this.i + 1] === '=') {
            type = symbols.COMPARISON;
            str += '=';
            this.i++;
        } else {
            type = symbols.NEGATION;
        }

    } else if (char === MEMBER) {
        
        type = symbols.MEMBER;
    
    } else if (char === LPAREN) {
        
        type = symbols.LPAREN;
    
    } else if (char === RPAREN) {
        
        type = symbols.RPAREN;
    
    } else if (char === LBRACKET) {
            
        type = symbols.LBRACKET;
    
    } else if (char === RBRACKET) {
        
        type = symbols.RBRACKET;
    
    } else if (char === LBRACE) {
        
        type = symbols.LBRACE;
    
    } else if (char === RBRACE) {
        
        type = symbols.RBRACE;
    
    } else if (char === COLON) {
        
        type = symbols.COLON;
        
    } else if (char === COMMA) {
        
        type = symbols.COMMA;
    
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


//////////


var WHITESPACE = /\s/,
    SUM = /[-+]/,
    MULTIPLY = /[*/%]/,
    NEGATION = '!',
    MEMBER = '.',
    COMPARISON = /[<>=]/,
    LITERAL = /['"]/,
    IDENT_START = /[a-z_$]/i,
    IDENT = /[\w_$]/,
    NUMBER = /\d/,
    LPAREN = '(',
    RPAREN = ')',
    LBRACKET = '[',
    RBRACKET = ']',
    LBRACE = '{',
    RBRACE = '}',
    COLON = ':',
    COMMA = ',',
    FILTER = '|';