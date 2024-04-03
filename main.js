"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var lexer_1 = require("./lexer");
var semanticAnalyzer_1 = require("./semanticAnalyzer");
var parser_1 = require("./parser");
// Read the input file
var inputFileName = 'input.txt';
var inputText;
try {
    inputText = fs.readFileSync(inputFileName, 'utf-8');
}
catch (error) {
    console.error("Error reading input file: ".concat(error.message));
    process.exit(1);
}
// Create a lexer and semantic analyzer
var semanticAnalyzer = new semanticAnalyzer_1.SemanticAnalyzer();
var lexer = new lexer_1.Lexer(inputText, semanticAnalyzer);
// Create a parser
var parser = new parser_1.Parser(lexer, semanticAnalyzer);
// Parse the input
try {
    parser.parse();
}
catch (error) {
    console.error(error.message);
}
