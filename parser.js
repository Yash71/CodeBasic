"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
var Parser = /** @class */ (function () {
    function Parser(lexer, semanticAnalyzer) {
        this.variables = {};
        this.lexer = lexer;
        this.currentToken = this.lexer.getNextToken();
        this.semanticAnalyzer = semanticAnalyzer;
    }
    Parser.prototype.eat = function (tokenType) {
        if (this.currentToken.tokenType === tokenType) {
            this.currentToken = this.lexer.getNextToken();
        }
        else {
            throw new Error("Expected ".concat(tokenType, " but found ").concat(this.currentToken.tokenType));
        }
    };
    Parser.prototype.show = function () {
        this.eat('SHOW'); // Consume the 'show' token
        var token = this.currentToken;
        if (token.tokenType === 'STRING') {
            var value = token.value.slice(0, -1); // Remove the quotes
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
                throw new Error("Undeclared variable ".concat(variableName));
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
            if (this.semanticAnalyzer.symbolTable.hasOwnProperty(variableName)) {
                this.eat('CHAR');
                var variableValue = this.semanticAnalyzer.symbolTable[variableName];
                return typeof variableValue === 'number' ? variableValue : parseInt(variableValue.value);
            }
            else {
                throw new Error("Undeclared variable ".concat(variableName));
            }
        }
        else {
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
        while (this.currentToken.tokenType === 'OPERATOR' && (this.currentToken.value === '+' || this.currentToken.value === '-')) {
            var token = this.currentToken;
            if (token.value === '+') {
                this.eat('OPERATOR');
                result += this.term();
            }
            else if (token.value === '-') {
                this.eat('OPERATOR');
                result -= this.term();
            }
        }
        return result;
    };
    Parser.prototype.parse = function () {
        var errors = [];
        while (this.currentToken.tokenType !== 'EOF') {
            if (this.currentToken.value === 'declare') {
                this.eat('DECLARE'); // Consume the 'declare' token
                var variableName = this.currentToken.value;
                // if (this.semanticAnalyzer.symbolTable.hasOwnProperty(variableName)) {
                //     errors.push(`Variable '${variableName}' is already declared`);
                // }
                this.eat('CHAR'); // Consume the variable name token
                this.eat('OPERATOR'); // Consume the '=' token
                var value = this.expr();
                this.variables[variableName] = value;
                this.semanticAnalyzer.declareVariable(variableName, value.toString(), 'INTEGER', 'INTEGER');
            }
            else if (this.currentToken.value === 'show') {
                this.show(); // Handle the 'show' statement
            }
            else {
                errors.push("Invalid token: ".concat(this.currentToken.value));
            }
        }
        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }
    };
    return Parser;
}());
exports.Parser = Parser;
