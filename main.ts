import express from 'express';
import bodyParser from 'body-parser';
import * as fs from 'fs';
import { Lexer } from './lexer';
import { SemanticAnalyzer } from './semanticAnalyzer';
import { Parser } from './parser';
import cors from 'cors';
import path from 'path';

const app = express();
const port = 3000;
app.get('/execute', (req, res) => {
    // const {code,input}=req.body;
    // console.log({code,input});


    app.use(express.static(path.join(__dirname, "../Front-end/IDE")));
    res.sendFile(path.join(__dirname, '../Front-end/IDE/index.html'));

    // res.status(200).json({ info: 'preset text' })
    let codeText = req.query.code as string ?? '';
    codeText = codeText.replace(/^"(.*)"$/, '$1').replace(/\\n/g, '\n').replace(/\\"/g, '"');

    // console.log(codeText);

    fs.writeFile('input.txt', codeText, (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return;
        }
        // console.log('File written successfully');
    });


    const inputFileName = 'input.txt';

    let inputText: string;
    try {
        inputText = fs.readFileSync(inputFileName, 'utf-8');
    } catch (error: any) {
        console.error(`Error reading input file: ${error.message}`);
        process.exit(1);
    }
    const semanticAnalyzer = new SemanticAnalyzer();
    const lexer = new Lexer(codeText, semanticAnalyzer);

    // Create a parser
    const parser = new Parser(lexer, semanticAnalyzer);

    let output: string;

    // Parse the input
    try {
        parser.parse();
        // const output = parser.output; // Get the output value from the parser
        let output = parser.output;
        if (output !== undefined) {

            console.log(output);
        }
        // res.json({output});
        // res.send(output);
        // console.log(output);
        // // res.json({ output });
        // console.log(output);
        // res.send(output);
    } catch (error: any) {
        console.error(error.message);
    }

    // fs.writeFile('output.txt', codeText, (err) => {
    //     if (err) {
    //         console.error('Error writing file:', err);
    //         return;
    //     }
    //     console.log('File written successfully');
    // });


})
// app.use(bodyParser.json());
// app.use(cors());
// app.get('/execute', (req, res) => {
//     const { code, input } = req.body;
//     console.log(code);
//     // Define the filename for the user-submitted code
//     const inputFileName = 'input.txt';

//     // Write the user code to the text file
//     fs.writeFileSync(inputFileName, code);

//     // Read the code from the text file
//     let inputText: string;
//     try {
//         inputText = fs.readFileSync(inputFileName, 'utf-8');
//     } catch (error) {
//         res.status(500).json({ output: `Error reading input file: ${(error as Error).message}` });
//         return;
//     }



// Create a lexer and semantic analyzer
//     const semanticAnalyzer = new SemanticAnalyzer();
//     const lexer = new Lexer(inputText, semanticAnalyzer);

//     // Create a parser
//     const parser = new Parser(lexer, semanticAnalyzer);

//     // Parse the input
//     try {
//         parser.parse();
//         res.json({ output: 'Code executed successfully' });
//     } catch (error) {
//         res.json({ output: `Error: ${(error as Error).message}` });
//     }

//     // Clean up the text file
//     fs.unlinkSync(inputFileName);
// });

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
