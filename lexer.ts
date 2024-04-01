import { error } from 'console';
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
        while (this.currentChar && /[a-zA-Z]/.test(this.currentChar)) {
            result += this.currentChar;
            this.advance();
        }

        // Check if the variable is being redeclared
        if (this.semanticAnalyzer.symbolTable.hasOwnProperty(result) && this.semanticAnalyzer.symbolTable[result].declarationType === 'DECLARE') {
            throw new Error(`Redeclaration of variable '${result}' not allowed`);
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
    
            if (/[a-zA-Z]/.test(this.currentChar)) {
                let value = this.char();
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
    
            throw new Error(`Invalid character: ${this.currentChar}`);
        }
    
        return new Token('EOF', '');
    }
    
}
