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
            tableDef += parseField(identifier.getText(), f.getChildren().find(n => n.kind == ts.SyntaxKind.Identifier).getText(), f);
        })


    })
})

//Parses a node and returns a SurrealQL schema string for it.
function parseField(table: string, name: string, f: ts.Node) {
    //TODO: parse decorator for permissions, defaults and constraints.
    //The decorator will be the only possible SyntaxList on the field.
    const decorator = f.getChildren().find(n => n.kind == ts.SyntaxKind.SyntaxList);

    //Whether this field is optional or not (ie contains ?)
    const optional: boolean = f.getChildren().some(n => n.kind == ts.SyntaxKind.QuestionToken);

    let type;

    //Assign type string if it doesn't already have a type.
    type ||= f.getChildren()?.find(n => n.kind == 152)?.getText();

    //Assign tpe number if it doesn't already have a type.
    type ||= f.getChildren()?.find(n => n.kind == 148)?.getText();
    
    
    //The Type Reference (if it exists). Since we already assume this type exists,
    //We just need to clarify to Surreal that its a table reference.
    const ref = f.getChildren().find(n => n.kind == ts.SyntaxKind.TypeReference);

    if (ref) {
        //Type needs to be record(underlyingType).
        const ident = ref.getChildren().find(c => ts.isIdentifier(c));

        //This does not work for Date types.
        type = `record(${ident.getText()})`;
    }

    //The array type, if it is an array. This type will contain the inner type/ident.
    const arr = f.getChildren().find(n => n.kind == ts.SyntaxKind.ArrayType);

    if (arr) {
        type = 'array';
    }

    let fieldStr = `DEFINE FIELD ${name} ON TABLE ${table} SCHEMAFULL\n\tTYPE ${type}`;

    if (arr) {
        //TODO: verify that getChildAt does not lead to bugs.
        fieldStr += parseField(table, name + '.*', f.getChildAt(0));
    }

    fieldStr += '\n\t\tPERMISSIONS';

    console.log(fieldStr);
}

//Generates a full SurrealQL field definition for the node. Expects node to be a PropertyDeclaration.
function generateField(node: ts.Node): string {

}