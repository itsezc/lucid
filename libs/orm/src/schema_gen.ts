import { exit } from "process";
import { Field, ITable, Model, Table, Scope } from ".";
import * as ts from 'typescript';

const fileName = './organization.spec.ts';


//Read project files and create program.

process.chdir('../../../example');


const cfgFile = ts.findConfigFile(process.cwd(), ts.sys.fileExists, 'tsconfig.json');
const { config } = ts.readConfigFile(cfgFile, ts.sys.readFile);

//Disable JS emit
config.compilerOptions.noEmit = true;

const { options, fileNames, errors } = ts.parseJsonConfigFileContent(config, ts.sys, process.cwd());


function buildQuery() {
    const program = ts.createProgram(fileNames, options);

    const { diagnostics, emitSkipped } = program.emit()

    const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(diagnostics, errors)

    //Print any warnings that Typescript has detected.
    if (allDiagnostics.length) {
        const formatHost: ts.FormatDiagnosticsHost = {
            getCanonicalFileName: (path) => path,
            getCurrentDirectory: ts.sys.getCurrentDirectory,
            getNewLine: () => ts.sys.newLine,
        }
        const message = ts.formatDiagnostics(allDiagnostics, formatHost)
        console.warn(message)
    }

    program.getSourceFiles().forEach(x => parseSourceFile(x));
}

buildQuery();



function parseSourceFile(sourceFile: ts.SourceFile) {
    sourceFile.getChildren().forEach(child => {
        const classes = child.getChildren().filter(n => ts.isClassDeclaration(n));

        classes.forEach(classNode => {
            //Finds and verifies that the decorator matches.
            classNode.getChildren().filter(n => n.kind == ts.SyntaxKind.SyntaxList).forEach(ch => {
                //Each SyntaxList,
                const decorators = ch.getChildren().filter(n => ts.isDecorator(n));

                //Visit each decorator and check if it contains the 'Table' identifier.
                decorators.forEach(dec => {
                    const callExpression = dec.getChildren().find(ce => ts.isCallExpression(ce));
                    const ident = callExpression.getChildren().find(c => ts.isIdentifier(c));

                    parseDecorator(dec, ident.getText());


                    const tableIdent = classNode.getChildren().find(n => ts.isIdentifier(n));

                    console.log("TABLE: " + tableIdent.getText());

                    if (ident.getText() == 'Table') {
                        //Decorator matches, construct SurrealQL.
                        constructTable(classNode);
                    }
                });
            });
        })
    });
}


function constructTable(n: ts.Node) {
    const identifier = n.getChildren().find(n => ts.isIdentifier(n));
    let tableDef = `DEFINE TABLE ${identifier.getText()} SCHEMAFULL\n\tPERMISSIONS\n\t\tNONE`;

    //Construct table perms, assertions.


    //Construct table fields.
}

//Takes a field of unknown type, identifies its type and parses it.
function parseUnknown(n: ts.Node, table: string): string {
    //String
    if (n.getChildren().some(n => n.kind == ts.SyntaxKind.StringKeyword)) {
        return parseString(n, table);
    }

    //Number
    if (n.getChildren().some(n => n.kind == ts.SyntaxKind.NumberKeyword)) {
        return parseNum(n, table);
    }

    //console.log(n.getChildren().map(n => n.getText()));

    //SyntaxList, parse deeper.
    if (n.getChildren().some(n => n.kind == ts.SyntaxKind.SyntaxList)) {
        //The decorator generally is a SyntaxList.

        //Try to extract the Decorator, Anonymous Object or Array.

        const syntaxList = n.getChildren().filter(n => n.kind == ts.SyntaxKind.SyntaxList);
        syntaxList.forEach(sl => {

        })
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
        `\tTYPE record()\n` +
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

//Returns a permission string + assertions for the decorator supplied.
function parseDecorator(n: ts.Node, tableName: string) {
    //The body of the decorator.
    const callExpression = n.getChildren().find(ce => ts.isCallExpression(ce));
    const syntax = callExpression.getChildren()?.find(c => c.kind == ts.SyntaxKind.SyntaxList);

    const decoratorBody = syntax.getChildren().find(c => ts.isObjectLiteralExpression(c)) || null;


    const decoratorSl = decoratorBody?.getChildren()?.find(c => c.kind == ts.SyntaxKind.SyntaxList) || null;

    //Get all prop assignments in this property.
    const propAssignment = decoratorSl?.getChildren()?.filter(c => ts.isPropertyAssignment(c)) || null;

    if (propAssignment) {
        propAssignment.forEach(propAss => {
            //Check if it is a permissions, assertion, edge, or name.
            const ident = propAss.getChildren().find(c => ts.isIdentifier(c));
    
            switch (ident.getText()) {
                case 'edge':
                    break;
    
                case 'permissions':
                    parsePermissions(propAss);
                    break;
    
                case 'assert':
                    break;
    
                case 'name':
                    break;
                default:
                    break;
            }
        });
    }


}


//Parses the permission decorator into SurrealQL.
function parsePermissions(n: ts.Node): string {
    //We know its a permission property, so it MUST have an arrow function.
    const arrowFn = n.getChildren().find(c => ts.isArrowFunction(c));

    const parenExpr = arrowFn.getChildren().find(c => ts.isParenthesizedExpression(c));

    const objLiteral = parenExpr.getChildren().find(c => ts.isObjectLiteralExpression(c));
    const objLiteralSyntax = objLiteral.getChildren().find(c => c.kind == ts.SyntaxKind.SyntaxList);

    const propertyAssignments = objLiteralSyntax.getChildren().filter(c => ts.isPropertyAssignment(c));

    let permStr = '\tPERMISSIONS\n';

    propertyAssignments.forEach(prop => {

        const permType = prop.getChildren().find(c => ts.isIdentifier(c)).getText();

        console.log(prop.getChildren().map(c => ts.SyntaxKind[c.kind]));

        permStr += `\tFOR ${permType.toUpperCase()}`

        const trueKeyword = prop.getChildren().find(c => c.kind == ts.SyntaxKind.TrueKeyword);
        const falseKeyword = prop.getChildren().find(c => c.kind == ts.SyntaxKind.FalseKeyword);

        const binExpression = prop.getChildren().find(c => ts.isBinaryExpression(c));
        const callExpression = prop.getChildren().find(c => ts.isCallExpression(c));
        const identifier = prop.getChildren().find(c => ts.isIdentifier(c));



        if (trueKeyword) {
            permStr += ` FULL`;
        }
        else if (falseKeyword) {
            permStr += ` NONE`;
        }
        else if (binExpression) {
            const callExpr = binExpression.getChildren().find(c => ts.isCallExpression(c));
            //TODO: Trace scope for things like AdminScope, query(), methods on types.
            console.log("Binary expression!");
        }
        else if (callExpression) {
            //Handle complex queries.
        }
        else if (identifier) {
            //Get prototype on identifier (ie AdminScope.prototype.getText());
            
        }
        else if (prop.getChildren().find(c => c.kind == ts.SyntaxKind.ArrayType)) {
            //Array: [[[CREATE, UPDATE, SELECT], false]]
        }
        
        else {
            console.log("Other kind: " + prop.getChildren().map(c => ts.SyntaxKind[c.kind]))
            //Unknown type? Might be a scope reference or object method.
           
        }

        permStr += ',\n';

    });

    console.log(permStr);

}


//Parses an object and returns the equivalent SurrealQL string. (ie, each subfield of that object will have its own 'DEFINE' ).
function parseObject(n: ts.Node) {

}


//Generates a full SurrealQL field definition for the node. Expects node to be a PropertyDeclaration.
function generateField(node: ts.Node): string {

}