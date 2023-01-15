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

        //The table identifier if it exists,
        const identifier = classNode.getChildren().find(n => ts.isIdentifier(n));
        let decorator: ts.Node | null;
    

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
            })
        });

        console.log(identifier.getText());

        console.log(camel_)


    })
})


//Generates a full SurrealQL table definition for the node. Expects node to be a ClassDefinition.
function generateTable(node: ts.Node): string {

}

//Generates a full SurrealQL field definition for the node. Expects node to be a PropertyDeclaration.
function generateField(node: ts.Node): string {

}