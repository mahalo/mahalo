/**
 * This module exports symbol identifiers for the lexer and parser.
 */

/***/

enum symbols {
    Sum,
    Multiply,
    Negation,
    Member,
    Comparison,
    Literal,
    Identifier,
    Number,
    LParenthesis,
    RParenthesis,
    LBracket,
    RBracket,
    LBrace,
    RBrace,
    Colon,
    Comma,
    Filter,
    End
};

export default symbols;