"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
var Parser = /** @class */ (function () {
    function Parser(lexer, semanticAnalyzer) {
        this.variables = {};
        this.skipBlk = false;
        this.lexer = lexer;
        this.currentToken = this.lexer.getNextToken();
        this.semanticAnalyzer = semanticAnalyzer;
    }
    Parser.prototype.eat = function (tokenType) {
        if (this.currentToken.tokenType === tokenType) {
            this.currentToken = this.lexer.getNextToken();
            // console.log(this.currentToken);
        }
        else {
            throw new Error("Expected ".concat(tokenType, " but found ").concat(this.currentToken.tokenType));
        }
    };
    Parser.prototype.show = function () {
        this.eat('SHOW'); // Consume the 'show' token
        var token = this.currentToken;
        if (token.tokenType === 'STRING') {
            var value = token.value.slice(0); // Remove the quotes
            console.log(value);
            this.eat('STRING'); // Consume the string token
        }
        else if (token.tokenType === 'CHAR') {
            var variableName = token.value;
            if (this.semanticAnalyzer.symbolTable.hasOwnProperty(variableName)) {
                console.log(this.semanticAnalyzer.symbolTable[variableName].value);
                this.eat('CHAR'); // Consume the variable name token
            }
            else {
                throw new Error("Undeclared variable '".concat(variableName, "'"));
            }
        }
        else {
            throw new Error('Invalid show statement');
        }
    };
    Parser.prototype.factor = function () {
        var token = this.currentToken;
        if (token.tokenType === 'INTEGER') {
            this.eat('INTEGER');
            return parseInt(token.value);
        }
        else if (token.tokenType === 'CHAR') {
            var variableName = token.value;
            this.semanticAnalyzer.checkVariable(variableName); // Check if the variable is declared
            this.eat('CHAR');
            var variableValue = this.semanticAnalyzer.symbolTable[variableName];
            return typeof variableValue === 'number' ? variableValue : parseInt(variableValue.value);
        }
        else if (token.tokenType === 'LPAREN') {
            this.eat('LPAREN'); // Consume the '(' token
            var result = this.expr(); // Parse the expression inside parentheses
            this.eat('RPAREN'); // Consume the ')' token
            return result;
        }
        else {
            // console.log(token);
            throw new Error('Invalid factor');
        }
    };
    Parser.prototype.term = function () {
        var result = this.factor();
        while (this.currentToken.tokenType === 'OPERATOR' && (this.currentToken.value === '*' || this.currentToken.value === '/')) {
            var token = this.currentToken;
            if (token.value === '*') {
                this.eat('OPERATOR');
                result *= this.factor();
            }
            else if (token.value === '/') {
                this.eat('OPERATOR');
                var divisor = this.factor();
                if (divisor === 0) {
                    throw new Error('Division by zero');
                }
                result /= divisor;
            }
        }
        return result;
    };
    Parser.prototype.expr = function () {
        var result = this.term();
        while (this.currentToken.tokenType === 'OPERATOR' && (this.currentToken.value === '+' || this.currentToken.value === '-'
            || this.currentToken.value === '<' || this.currentToken.value === '>' || this.currentToken.value === '<=' || this.currentToken.value === '>=')) {
            var token = this.currentToken;
            if (token.value === '+') {
                this.eat('OPERATOR');
                result += this.term();
            }
            else if (token.value === '-') {
                this.eat('OPERATOR');
                result -= this.term();
            }
            else if (token.value === '<') {
                this.eat('OPERATOR');
                var right = this.expr();
                result = result < right ? 1 : 0;
            }
            else if (token.value === '>') {
                this.eat('OPERATOR');
                var right = this.expr();
                result = result > right ? 1 : 0;
            }
            else if (token.value === '<=') {
                this.eat('OPERATOR');
                var right = this.expr();
                result = result <= right ? 1 : 0;
            }
            else if (token.value === '>=') {
                this.eat('OPERATOR');
                var right = this.expr();
                result = result >= right ? 1 : 0;
            }
        }
        return result;
    };
    Parser.prototype.parse = function () {
        var errors = [];
        while (this.currentToken.tokenType !== 'EOF') {
            // console.log(this.currentToken);
            if (this.currentToken.value === 'declare') {
                this.eat('DECLARE'); // Consume the 'declare' token
                var variableName = this.currentToken.value;
                this.eat('CHAR'); // Consume the variable name token
                this.eat('OPERATOR'); // Consume the '=' token
                var value = this.expr();
                this.variables[variableName] = value;
                this.semanticAnalyzer.declareVariable(variableName, value.toString(), 'INTEGER', 'INTEGER');
            }
            else if (this.currentToken.value === 'show') {
                this.show(); // Handle the 'show' statement
            }
            else if (this.currentToken.tokenType === 'CHAR') {
                var variableName = this.currentToken.value;
                if (!this.semanticAnalyzer.symbolTable.hasOwnProperty(variableName)) {
                    console.log("here it is producing error");
                    throw new Error("Undeclared variable '".concat(variableName, "'"));
                }
                this.eat('CHAR'); // Consume the variable name token
                this.eat('OPERATOR'); // Consume the '=' token
                var value = this.expr();
                this.variables[variableName] = value;
                this.semanticAnalyzer.assignVariable(variableName, value.toString());
            }
            else if (this.currentToken.value === 'if') {
                this.eat('IF'); // Consume the 'IF' token
                var condition = this.expr(); // Parse the condition
                if (this.semanticAnalyzer.checkCondition(condition)) {
                    this.skipBlk = true;
                    this.eat('THEN'); // Consume the 'THEN' token
                    this.parse(); // Parse the 'IF' block                    
                }
                else {
                    this.skipBlock('ENDIF');
                    // console.log(this.skipBlk);
                }
            }
            else if (this.currentToken.value === 'else') {
                // console.log(this.skipBlk);
                if (!this.skipBlk) {
                    this.eat('ELSE');
                    this.parse();
                }
                else {
                    this.skipBlock('ENDELSE');
                }
                this.skipBlk = false;
            }
            else if (this.currentToken.tokenType === 'ENDIF') {
                this.eat('ENDIF'); // Consume the 'ENDIF' token
            }
            else if (this.currentToken.tokenType === 'ENDELSE') {
                this.eat('ENDELSE'); // Consume the 'ENDELSE' token
            }
            else {
                throw new Error("Unexpected token: ".concat(this.currentToken.value));
            }
        }
    };
    Parser.prototype.skipBlock = function (endToken) {
        while (this.currentToken.tokenType !== 'EOF' && this.currentToken.tokenType !== endToken) {
            this.currentToken = this.lexer.getNextToken();
            // console.log(this.currentToken);
        }
        // if (this.currentToken.value === endToken) {
        //     this.currentToken = this.lexer.getNextToken(); // Consume the endToken
        // }
    };
    return Parser;
}());
exports.Parser = Parser;
