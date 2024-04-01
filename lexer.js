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
        while (this.currentChar && /[a-zA-Z]/.test(this.currentChar)) {
            result += this.currentChar;
            this.advance();
        }
        // Check if the variable is being redeclared
        if (this.semanticAnalyzer.symbolTable.hasOwnProperty(result) && this.semanticAnalyzer.symbolTable[result].declarationType === 'DECLARE') {
            throw new Error("Redeclaration of variable '".concat(result, "' not allowed"));
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
            if (/[a-zA-Z]/.test(this.currentChar)) {
                var value = this.char();
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
            throw new Error("Invalid character: ".concat(this.currentChar));
        }
        return new Token('EOF', '');
    };
    return Lexer;
}());
exports.Lexer = Lexer;
