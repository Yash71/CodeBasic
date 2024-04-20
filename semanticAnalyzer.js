"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemanticAnalyzer = void 0;
var SemanticAnalyzer = /** @class */ (function () {
    function SemanticAnalyzer() {
        this.symbolTable = {};
    }
    SemanticAnalyzer.prototype.declareVariable = function (name, value, declarationType, type) {
        if (this.symbolTable.hasOwnProperty(name)) {
            throw new Error("Variable '".concat(name, "' is already declared"));
        }
        this.symbolTable[name] = { value: value, declarationType: declarationType, type: type };
    };
    SemanticAnalyzer.prototype.assignVariable = function (name, value) {
        if (!this.symbolTable.hasOwnProperty(name)) {
            throw new Error("Undeclared variable '".concat(name, "'"));
        }
        this.symbolTable[name].value = value;
    };
    SemanticAnalyzer.prototype.checkVariable = function (variableName) {
        if (!this.symbolTable.hasOwnProperty(variableName)) {
            throw new Error("Undeclared variable '".concat(variableName, "'"));
        }
    };
    SemanticAnalyzer.prototype.checkDivisionByZero = function (divisor) {
        if (divisor === 0) {
            throw new Error('Division by zero');
        }
    };
    SemanticAnalyzer.prototype.getVariableValue = function (variableName) {
        this.checkVariable(variableName);
        return this.symbolTable[variableName].value;
    };
    SemanticAnalyzer.prototype.getVariableType = function (variableName) {
        this.checkVariable(variableName);
        return this.symbolTable[variableName].type;
    };
    // if-else
    SemanticAnalyzer.prototype.checkCondition = function (condition) {
        // Simply check the condition without throwing an error
        return !!condition; // Convert the condition to a boolean
    };
    SemanticAnalyzer.prototype.checkElseBlock = function (elseBlockReached) {
        if (!elseBlockReached) {
            throw new Error('ELSE statement without corresponding IF');
        }
    };
    SemanticAnalyzer.prototype.checkEndIf = function (endIfReached) {
        if (!endIfReached) {
            throw new Error('ENDIF statement without corresponding IF');
        }
    };
    return SemanticAnalyzer;
}());
exports.SemanticAnalyzer = SemanticAnalyzer;
