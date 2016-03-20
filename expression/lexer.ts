import * as symbols from './symbols';

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

export class Symbol {
	type: number
	
	str: string
	
	start: number
	
	constructor(type, str, start) {
		this.type = type;
		this.str = str;
		this.start = start;
	}
}

export function nextSymbol() {
	var exp = this.exp,
		char = exp[++this.i],
		type,
		str,
		start;
	
	while (char && WHITESPACE.test(char)) {
		char = exp[++this.i];
	}
	
	str = char;
	start = this.i;
	
	if (!char) {
		
		type = symbols.END;
		str = '';
		
	} else if (COMPARISON.test(char)) {
		
		type = symbols.COMPARISON;
		char = exp[this.i + 1];
		
		if (COMPARISON.test(char)) {
			if (str == '=') {
				throw Error('Unexpected character in colum ' + this.i + ': ' + char);
			}
			
			str += char;
			this.i++;
		}
		
	} else if (LITERAL.test(char)) {
		
		var mark = char,
			esc;
	
		type = symbols.LITERAL;
		str = '';
		char = exp[++this.i];
		
		while (char && (char !== mark || esc)) {
			esc = char === '\\' && !esc;
			str += char;
			char = exp[++this.i];
		}
		
	} else if (NUMBER.test(char)) {
		
		type = symbols.NUMBER;
		char = exp[++this.i];
		
		while (char && NUMBER.test(char)) {
			str += char;
			char = exp[++this.i];
		}
		
		if (char === '.') {
			str += char;
			char = exp[++this.i];
			
			while (char && NUMBER.test(char)) {
				str += char;
				char = exp[++this.i];
			}
		}
		
		this.i--;
		
	} else if (IDENT_START.test(char)) {
		
		type = symbols.IDENT;
		char = exp[++this.i];
		
		while (char && IDENT.test(char)) {
			str += char;
			char = exp[++this.i];
		}
		
		this.i--;
	
	} else if (char === FILTER) {
		
		type = symbols.FILTER;
	
	} else if (SUM.test(char)) {
		
		type = symbols.SUM;
	
	} else if (MULTIPLY.test(char)) {
		
		type = symbols.MULTIPLY;
	
	} else if (char === NEGATION) {
		
		type = symbols.NEGATION;
	
	} else if (char === MEMBER) {
		
		type = symbols.MEMBER;
	
	} else if (char === LPAREN) {
		
		type = symbols.LPAREN;
	
	} else if (char === RPAREN) {
		
		type = symbols.RPAREN;
	
	} else if (char === LBRACKET) {
		
		// if (exp[this.i - 1] === MEMBER) {
			
		// 	char = exp[++this.i];
		// 	str = '';
			
		// 	while (char && char !== RBRACKET) {
		// 		if (char === '\\' && exp[this.i - 1] !== '\\' && exp[this.i + 1] === RBRACKET) {
		// 			char = exp[++this.i];
		// 		}
				
		// 		str += char;
				
		// 		char = exp[++this.i];
		// 	}
			
		// 	type = symbols.IDENT;
			
		// } else {
			
			type = symbols.LBRACKET;
			
		// }
	
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