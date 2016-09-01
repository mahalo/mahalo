/**
 * This module exports types identifiers for the parser and compiler.
 */

/***/

enum types {
    Filter,
    Comparison,
    Sum,
    Multiply,
    Unary,
    Parenthesis,
    Member,
    Literal,
    Number,
    Identifier,
    Object,
    Array,
    BracketIdentifier,
    Call,
    Reserved
};

export default types;