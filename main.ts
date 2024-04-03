import * as fs from 'fs';
import { Lexer } from './lexer';
import { SemanticAnalyzer } from './semanticAnalyzer';
import { Parser } from './parser';

// Read the input file
const inputFileName = 'input.txt';
let inputText: string;
try {
    inputText = fs.readFileSync(inputFileName, 'utf-8');
} catch (error) {
    console.error(`Error reading input file: ${error.message}`);
    process.exit(1);
}

// Create a lexer and semantic analyzer
const semanticAnalyzer = new SemanticAnalyzer();
const lexer = new Lexer(inputText, semanticAnalyzer);

// Create a parser
const parser = new Parser(lexer, semanticAnalyzer);

// Parse the input
try {
    parser.parse();
} catch (error) {
    console.error(error.message);
}
