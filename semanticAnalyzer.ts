export class SemanticAnalyzer {
    symbolTable: { [name: string]: { value: string, declarationType: string, type: string } };

    constructor() {
        this.symbolTable = {};
    }

    declareVariable(name: string, value: string, declarationType: string, type: string) {
        if (this.symbolTable.hasOwnProperty(name)) {
            throw new Error(`Variable '${name}' is already declared`);
        }
        this.symbolTable[name] = { value, declarationType, type };
    }

    assignVariable(name: string, value: string) {
        if (!this.symbolTable.hasOwnProperty(name)) {
            throw new Error(`Undeclared variable '${name}'`);
        }
        this.symbolTable[name].value = value;
    }

    checkVariable(variableName: string) {
        if (!this.symbolTable.hasOwnProperty(variableName)) {
            throw new Error(`Undeclared variable '${variableName}'`);
        }
    }

    checkDivisionByZero(divisor: number) {
        if (divisor === 0) {
            throw new Error('Division by zero');
        }
    }

    getVariableValue(variableName: string): string {
        this.checkVariable(variableName);
        return this.symbolTable[variableName].value;
    }

    getVariableType(variableName: string): string {
        this.checkVariable(variableName);
        return this.symbolTable[variableName].type;
    }
}
