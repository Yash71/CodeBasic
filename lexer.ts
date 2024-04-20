import { SemanticAnalyzer } from './semanticAnalyzer';

export class Token {
    tokenType: string;
    value: string;

    constructor(tokenType: string, value: string) {
        this.tokenType = tokenType;
        this.value = value;
    }
}

export class Lexer {
    text: string;
    pos: number;
    currentChar: string | null;
    semanticAnalyzer: SemanticAnalyzer;

    constructor(text: string, semanticAnalyzer: SemanticAnalyzer) {
        this.text = text;
        this.pos = 0;
        this.currentChar = this.text[this.pos];
        this.semanticAnalyzer = semanticAnalyzer;
    }

    advance() {
        this.pos++;
        if (this.pos >= this.text.length) {
            this.currentChar = null;
        } else {
            this.currentChar = this.text[this.pos];
        }
    }

    skipWhitespace() {
        while (this.currentChar && /\s/.test(this.currentChar)) {
            this.advance();
        }
    }
    peek() {
        if (this.pos + 1 < this.text.length) {
            return this.text[this.pos + 1];
        }
        return null;
    }

    peekNext() {
        if (this.pos + 1 < this.text.length) {
            return this.text[this.pos + 1];
        }
        return null;
    }
    

    peekNextNext() {
        if (this.pos + 3 < this.text.length) {
            return this.text[this.pos + 3];
        }
        return null;
    }
    integer(): string {
        let result = '';
        while (this.currentChar && /[0-9]/.test(this.currentChar)) {
            result += this.currentChar;
            this.advance();
        }
        return result;
    }

    char(): string {
        let result = '';
        if (!this.currentChar || !/[a-zA-Z]/.test(this.currentChar)) {
            throw new Error(`Invalid character: ${this.currentChar}`);
        }
        while (this.currentChar && /[a-zA-Z]/.test(this.currentChar)) {
            result += this.currentChar;
            this.advance();
        }

        return result;
    }

    getNextToken(): Token {
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
                let op = this.currentChar;
                this.advance(); // Consume the '<' or '>'
                this.advance(); // Consume the '='
                return new Token('OPERATOR', op + '=');
            } else if (this.currentChar === '<' && this.peekNext() === '=') {
                this.advance(); // Consume the '<'
                this.advance(); // Consume the '='
                return new Token('OPERATOR', '<=');
            } else if (this.currentChar === '>' && this.peekNext() === '=') {
                this.advance(); // Consume the '>'
                this.advance(); // Consume the '='
                return new Token('OPERATOR', '>=');
            } else if (this.currentChar === '<' || this.currentChar === '>') {
                let op = this.currentChar;
                this.advance();
                return new Token('OPERATOR', op);
            }
            if (/[a-zA-Z]/.test(this.currentChar)) {
                let value = this.char();
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
                } else if (value === 'show') {
                    return new Token('SHOW', value);
                } else {
                    return new Token('CHAR', value);
                }
            }

            if (this.currentChar === '=') {
                this.advance();
                return new Token('OPERATOR', '=');
            }

            if (this.currentChar === '"') {
                this.advance();
                let start = this.pos;
                while (this.currentChar !== '"' && this.currentChar !== null) {
                    this.advance();
                }
                let value = this.text.slice(start, this.pos);
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

            throw new Error(`Invalid character: ${this.currentChar}`);
        }

        return new Token('EOF', '');
    }

}
