import { Token } from './lexer';
import { Lexer } from './lexer';
import { SemanticAnalyzer } from './semanticAnalyzer';


export class Parser {
    lexer: Lexer;
    currentToken: Token;
    semanticAnalyzer: SemanticAnalyzer;
    variables: { [key: string]: number } = {};
    skipBlk: boolean = false;
    output : string ='';
    constructor(lexer: Lexer, semanticAnalyzer: SemanticAnalyzer) {
        this.lexer = lexer;
        this.currentToken = this.lexer.getNextToken();
        this.semanticAnalyzer = semanticAnalyzer;
    }

    eat(tokenType: string) {
        if (this.currentToken.tokenType === tokenType) {
            this.currentToken = this.lexer.getNextToken();
            // console.log(this.currentToken);
        } else {
            throw new Error(`Expected ${tokenType} but found ${this.currentToken.tokenType}`);
        }
    }

    show() {
        // let output='';
        let value='';
        
        this.eat('SHOW'); // Consume the 'show' token
        let token = this.currentToken;
        if (token.tokenType === 'STRING') {
            let value = token.value.slice(0); // Remove the quotes
            // console.log(value);
            // this.output = value;
            
            this.output=value;
            this.eat('STRING'); // Consume the string token
        } else if (token.tokenType === 'CHAR') {
            let variableName = token.value;
            if (this.semanticAnalyzer.symbolTable.hasOwnProperty(variableName)) {
                // this.output = this.semanticAnalyzer.symbolTable[variableName].value.toString();
                console.log(this.semanticAnalyzer.symbolTable[variableName].value.toString());
                this.eat('CHAR'); // Consume the variable name token
                return this.output;
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
        } else if (token.tokenType === 'LPAREN') {
            this.eat('LPAREN'); // Consume the '(' token
            let result = this.expr(); // Parse the expression inside parentheses
            this.eat('RPAREN'); // Consume the ')' token
            return result;
        }
        else {
            // console.log(token);
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

        while (this.currentToken.tokenType === 'OPERATOR' && (this.currentToken.value === '+' || this.currentToken.value === '-'
            || this.currentToken.value === '<' || this.currentToken.value === '>' || this.currentToken.value === '<=' || this.currentToken.value === '>=')) {
            let token = this.currentToken;
            if (token.value === '+') {
                this.eat('OPERATOR');
                result += this.term();
            } else if (token.value === '-') {
                this.eat('OPERATOR');
                result -= this.term();
            } else if (token.value === '<') {
                this.eat('OPERATOR');
                let right = this.expr();
                result = result < right ? 1 : 0;
            } else if (token.value === '>') {
                this.eat('OPERATOR');
                let right = this.expr();
                result = result > right ? 1 : 0;
            } else if (token.value === '<=') {
                this.eat('OPERATOR');
                let right = this.expr();
                result = result <= right ? 1 : 0;
            } else if (token.value === '>=') {
                this.eat('OPERATOR');
                let right = this.expr();
                result = result >= right ? 1 : 0;
            }
        }

        return result;
    }


    parse() {
        const errors: string[] = [];
        while (this.currentToken.tokenType !== 'EOF') {
            // console.log(this.currentToken);

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
                    // console.log("here it is producing error");
                    throw new Error(`Undeclared variable '${variableName}'`);
                }
                this.eat('CHAR'); // Consume the variable name token
                this.eat('OPERATOR'); // Consume the '=' token
                let value = this.expr();
                this.variables[variableName] = value;
                this.semanticAnalyzer.assignVariable(variableName, value.toString());
            } else if (this.currentToken.value === 'if') {
                this.eat('IF'); // Consume the 'IF' token
                let condition = this.expr(); // Parse the condition
                if (this.semanticAnalyzer.checkCondition(condition)) {
                    this.skipBlk = true;
                    this.eat('THEN'); // Consume the 'THEN' token
                    this.parse(); // Parse the 'IF' block                    
                } else {
                    this.skipBlock('ENDIF');

                    // console.log(this.skipBlk);
                }
            } else if (this.currentToken.value === 'else') {
                // console.log(this.skipBlk);
                if (!this.skipBlk) {
                    this.eat('ELSE');
                    this.parse();
                }
                else {
                    this.skipBlock('ENDELSE');
                }
                this.skipBlk = false;


            } else if (this.currentToken.tokenType === 'ENDIF') {
                this.eat('ENDIF'); // Consume the 'ENDIF' token
            } else if (this.currentToken.tokenType === 'ENDELSE') {
                this.eat('ENDELSE'); // Consume the 'ENDELSE' token
            }
            else {
                throw new Error(`Unexpected token: ${this.currentToken.value}`);
            }
        }
    }
    skipBlock(endToken: string) {
        while (this.currentToken.tokenType !== 'EOF' && this.currentToken.tokenType !== endToken) {

            this.currentToken = this.lexer.getNextToken();
            // console.log(this.currentToken);
           
        }
        // if (this.currentToken.value === endToken) {
        //     this.currentToken = this.lexer.getNextToken(); // Consume the endToken
        // }
    }



}
