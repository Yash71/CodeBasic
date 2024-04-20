"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexer = exports.Token = void 0;
var Token = /** @class */ (function () {
    function Token(tokenType, value) {
        this.tokenType = tokenType;
        this.value = value;
    }
    return Token;
}());
exports.Token = Token;
var Lexer = /** @class */ (function () {
    function Lexer(text, semanticAnalyzer) {
        this.text = text;
        this.pos = 0;
        this.currentChar = this.text[this.pos];
        this.semanticAnalyzer = semanticAnalyzer;
    }
    Lexer.prototype.advance = function () {
        this.pos++;
        if (this.pos >= this.text.length) {
            this.currentChar = null;
        }
        else {
            this.currentChar = this.text[this.pos];
        }
    };
    Lexer.prototype.skipWhitespace = function () {
        while (this.currentChar && /\s/.test(this.currentChar)) {
            this.advance();
        }
    };
    Lexer.prototype.peek = function () {
        if (this.pos + 1 < this.text.length) {
            return this.text[this.pos + 1];
        }
        return null;
    };
    Lexer.prototype.peekNext = function () {
        if (this.pos + 1 < this.text.length) {
            return this.text[this.pos + 1];
        }
        return null;
    };
    Lexer.prototype.peekNextNext = function () {
        if (this.pos + 3 < this.text.length) {
            return this.text[this.pos + 3];
        }
        return null;
    };
    Lexer.prototype.integer = function () {
        var result = '';
        while (this.currentChar && /[0-9]/.test(this.currentChar)) {
            result += this.currentChar;
            this.advance();
        }
        return result;
    };
    Lexer.prototype.char = function () {
        var result = '';
        if (!this.currentChar || !/[a-zA-Z]/.test(this.currentChar)) {
            throw new Error("Invalid character: ".concat(this.currentChar));
        }
        while (this.currentChar && /[a-zA-Z]/.test(this.currentChar)) {
            result += this.currentChar;
            this.advance();
        }
        return result;
    };
    Lexer.prototype.getNextToken = function () {
        while (this.currentChar) {
            if (/\s/.test(this.currentChar)) {
                this.skipWhitespace();
                continue;
            }
            if (/[0-9]/.test(this.currentChar)) {
                return new Token('INTEGER', this.integer());
            }
            if (this.currentChar === '+') {
                this.advance();
                return new Token('OPERATOR', '+');
            }
            if (this.currentChar === '-') {
                this.advance();
                return new Token('OPERATOR', '-');
            }
            if (this.currentChar === '*') {
                this.advance();
                return new Token('OPERATOR', '*');
            }
            if (this.currentChar === '/') {
                this.advance();
                return new Token('OPERATOR', '/');
            }
            if ((this.currentChar === '<' || this.currentChar === '>') && this.peekNext() === '=') {
                var op = this.currentChar;
                this.advance(); // Consume the '<' or '>'
                this.advance(); // Consume the '='
                return new Token('OPERATOR', op + '=');
            }
            else if (this.currentChar === '<' && this.peekNext() === '=') {
                this.advance(); // Consume the '<'
                this.advance(); // Consume the '='
                return new Token('OPERATOR', '<=');
            }
            else if (this.currentChar === '>' && this.peekNext() === '=') {
                this.advance(); // Consume the '>'
                this.advance(); // Consume the '='
                return new Token('OPERATOR', '>=');
            }
            else if (this.currentChar === '<' || this.currentChar === '>') {
                var op = this.currentChar;
                this.advance();
                return new Token('OPERATOR', op);
            }
            if (/[a-zA-Z]/.test(this.currentChar)) {
                var value = this.char();
                if (value === 'if') {
                    return new Token('IF', 'if');
                }
                else if (value === 'else') {
                    return new Token('ELSE', 'else');
                }
                else if (value === 'then') {
                    return new Token('THEN', 'then');
                }
                else if (value === 'ENDif') {
                    return new Token('ENDIF', 'ENDif');
                }
                else if (value === 'ENDelse') {
                    return new Token('ENDELSE', 'ENDelse');
                }
                if (value === 'declare') {
                    return new Token('DECLARE', value);
                }
                else if (value === 'show') {
                    return new Token('SHOW', value);
                }
                else {
                    return new Token('CHAR', value);
                }
            }
            if (this.currentChar === '=') {
                this.advance();
                return new Token('OPERATOR', '=');
            }
            if (this.currentChar === '"') {
                this.advance();
                var start = this.pos;
                while (this.currentChar !== '"' && this.currentChar !== null) {
                    this.advance();
                }
                var value = this.text.slice(start, this.pos);
                if (this.currentChar === null) {
                    throw new Error('Unterminated string');
                }
                this.advance(); // Consume the closing quote
                return new Token('STRING', value);
            }
            if (this.currentChar === '(') {
                this.advance();
                return new Token('LPAREN', '(');
            }
            if (this.currentChar === ')') {
                this.advance();
                return new Token('RPAREN', ')');
            }
            if (this.currentChar === '{') {
                this.advance();
                return new Token('LBRACE', '{');
            }
            if (this.currentChar === '}') {
                this.advance();
                return new Token('RBRACE', '}');
            }
            throw new Error("Invalid character: ".concat(this.currentChar));
        }
        return new Token('EOF', '');
    };
    return Lexer;
}());
exports.Lexer = Lexer;
