import { Field, Model, Table } from "../src";
import * as ts from 'typescript';

const fileName = './organization.spec.ts';

const program = ts.createProgram([fileName], {});
const sourceFile = program.getSourceFile(fileName);

const diagnostics = ts.getPreEmitDiagnostics(program);
if (diagnostics.length > 0) {
    console.error('Error: the specified file has errors! Fix these errors and try again.');
    console.error(diagnostics[0].messageText);
}

sourceFile.forEachChild(node => {
    console.log(node.kind);
})