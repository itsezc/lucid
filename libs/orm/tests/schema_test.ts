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



sourceFile.getChildren().forEach(child => {
    const classes = child.getChildren().filter(n => ts.isClassDeclaration(n));

    classes.forEach(classNode => {
        //Each class delcaration,

        //The node identifying the table (ie the Table Name)
        const identifier = classNode.getChildren().find(n => ts.isIdentifier(n));
        
        //The class decorator
        let decorator: ts.Node | null;

        let fields: ts.Node[];
    

        //Finds and verifies that the decorator matches.
        classNode.getChildren().filter(n => n.kind == ts.SyntaxKind.SyntaxList).forEach(ch => {
            //Each SyntaxList,
            const decorators = ch.getChildren().filter(n => ts.isDecorator(n));

            //Visit each decorator and check if it contains the 'Table' identifier.
            decorators.forEach(dec => {
                const callExpression = dec.getChildren().find(ce => ts.isCallExpression(ce));
                const ident = callExpression.getChildren().find(c => ts.isIdentifier(c));

                if (ident.getText() == 'Table') {
                    decorator = dec;
                }
            });

            fields = ch.getChildren().filter(n => ts.isPropertyDeclaration(n));
        });

        //TODO: convert table name to snake_case.
        //TODO: parse permissions here:

        let tableDef = `DEFINE TABLE ${identifier.getText()} schemaless\n\tPERMISSIONS\n\t\tNONE`;
        


        fields.forEach(f => {
            tableDef += parseUnknown(f);
        })


    })
})

//Takes a node of unknown type, identifies its type and parses it.
function parseUnknown(n: ts.Node): string {
    //String
    if (n.getChildren().some(n => n.kind == ts.SyntaxKind.StringKeyword)) {
        return parseString(n);
    }

    //Number
    if (n.getChildren().some(n => n.kind == ts.SyntaxKind.NumberKeyword)) {
        return parseNum(n);
    }

    //SyntaxList, parse deeper.
    if (n.getChildren().some(n => n.kind == ts.SyntaxKind.SyntaxList)) {
        //SyntaxList might contain an array, object or some other funky non-primitive type.
    }
    
}

function parseString(n: ts.Node, table: string): string {
    const name = n.getChildren().find(n => ts.isIdentifier(n)).getText();
    return `DEFINE FIELD ${name} ON TABLE ${table}\n` +
            `\tTYPE string\n` +
            `\tASSERT ${null}\n` +
            `\t\tPERMISSIONS FULL`;
}

function parseNum(n: ts.Node, table: string): string {
    const name = n.getChildren().find(n => ts.isIdentifier(n)).getText();
    return `DEFINE FIELD ${table} ON TABLE ${table}\n` +
            `\tTYPE number\n` +
            `\tASSERT ${null}\n` +
            `\t\tPERMISSIONS FULL`;
}

function parseRef(n: ts.Node, table: string) {
    const name = n.getChildren().find(n => ts.isIdentifier(n)).getText();
    return `DEFINE FIELD ${name} ON TABLE ${table}\n` +
            `\tTYPE number\n` +
            `\tASSERT ${null}\n` +
            `\t\tPERMISSIONS FULL`;
}

function parseArr(n: ts.Node, table: string) {
    const name = n.getChildren().find(n => ts.isIdentifier(n)).getText();

    //TODO:
    //The underlying array type must be found so the array entries can be strongly typed with a schema.

    return `DEFINE FIELD ${name} ON TABLE ${table}\n` +
            `\tTYPE array\n` +
            `\tASSERT ${null}\n` +
            `\t\tPERMISSIONS FULL`;
}

function parseObject(n: ts.Node) {

}


//Generates a full SurrealQL field definition for the node. Expects node to be a PropertyDeclaration.
function generateField(node: ts.Node): string {

}