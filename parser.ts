import { Token } from './lexer';
import { Lexer } from './lexer';
import { SemanticAnalyzer } from './semanticAnalyzer';

export class Parser {
    lexer: Lexer;
    currentToken: Token;
    semanticAnalyzer: SemanticAnalyzer;
    variables: { [key: string]: number } = {};

    constructor(lexer: Lexer, semanticAnalyzer: SemanticAnalyzer) {
        this.lexer = lexer;
        this.currentToken = this.lexer.getNextToken();
        this.semanticAnalyzer = semanticAnalyzer;
    }

    eat(tokenType: string) {
        if (this.currentToken.tokenType === tokenType) {
            this.currentToken = this.lexer.getNextToken();
        } else {
            throw new Error(`Expected ${tokenType} but found ${this.currentToken.tokenType}`);
        }
    }

    show() {
        this.eat('SHOW'); // Consume the 'show' token
        let token = this.currentToken;
        if (token.tokenType === 'STRING') {
            let value = token.value.slice(0, -1); // Remove the quotes
            console.log(value);
            this.eat('STRING'); // Consume the string token
        } else if (token.tokenType === 'CHAR') {
            let variableName = token.value;
            if (this.semanticAnalyzer.symbolTable.hasOwnProperty(variableName)) {
                console.log(this.semanticAnalyzer.symbolTable[variableName].value);
                this.eat('CHAR'); // Consume the variable name token
            } else {
                throw new Error(`Undeclared variable '${variableName}'`);
            }
        } else {
            throw new Error('Invalid show statement');
        }
    }

    factor(): number {
        let token = this.currentToken;
        if (token.tokenType === 'INTEGER') {
            this.eat('INTEGER');
            return parseInt(token.value);
        } else if (token.tokenType === 'CHAR') {
            let variableName = token.value;
            this.semanticAnalyzer.checkVariable(variableName); // Check if the variable is declared
            this.eat('CHAR');
            let variableValue = this.semanticAnalyzer.symbolTable[variableName];
            return typeof variableValue === 'number' ? variableValue : parseInt(variableValue.value);
        } else {
            throw new Error('Invalid factor');
        }
    }



    term(): number {
        let result = this.factor();

        while (this.currentToken.tokenType === 'OPERATOR' && (this.currentToken.value === '*' || this.currentToken.value === '/')) {
            let token = this.currentToken;
            if (token.value === '*') {
                this.eat('OPERATOR');
                result *= this.factor();
            } else if (token.value === '/') {
                this.eat('OPERATOR');
                let divisor = this.factor();
                if (divisor === 0) {
                    throw new Error('Division by zero');
                }
                result /= divisor;
            }
        }

        return result;
    }

    expr(): number {
        let result = this.term();

        while (this.currentToken.tokenType === 'OPERATOR' && (this.currentToken.value === '+' || this.currentToken.value === '-')) {
            let token = this.currentToken;
            if (token.value === '+') {
                this.eat('OPERATOR');
                result += this.term();
            } else if (token.value === '-') {
                this.eat('OPERATOR');
                result -= this.term();
            }
        }

        return result;
    }

    parse() {
        const errors: string[] = [];
        while (this.currentToken.tokenType !== 'EOF') {
            if (this.currentToken.value === 'declare') {
                this.eat('DECLARE'); // Consume the 'declare' token
                let variableName = this.currentToken.value;
                this.eat('CHAR'); // Consume the variable name token
                this.eat('OPERATOR'); // Consume the '=' token
                let value = this.expr();
                this.variables[variableName] = value;
                this.semanticAnalyzer.declareVariable(variableName, value.toString(), 'INTEGER', 'INTEGER');
            } else if (this.currentToken.value === 'show') {
                this.show(); // Handle the 'show' statement
            } else if (this.currentToken.tokenType === 'CHAR') {
                let variableName = this.currentToken.value;
                if (!this.semanticAnalyzer.symbolTable.hasOwnProperty(variableName)) {
                    throw new Error(`Undeclared variable '${variableName}'`);
                }
                this.eat('CHAR'); // Consume the variable name token
                this.eat('OPERATOR'); // Consume the '=' token
                let value = this.expr();
                this.variables[variableName] = value;
                this.semanticAnalyzer.assignVariable(variableName, value.toString());
            }
            else {
                throw new Error(`Undeclared variable: ${this.currentToken.value}`);
            }
        }

        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }
    }



}
