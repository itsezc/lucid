import * as ts from 'byots';
import { getDeclaration, parseBinaryExpression } from './util';
import { checker, program } from './entry';

//Returns a SurrealQL string representing the decorator.
export function parseDecorator(dec: ts.Node): string[] {
    //Only one call expression for this decorator.
    const callExpression = dec.getChildren().find(ce => ts.isCallExpression(ce));
    let trueName: string = null;

    return [callExpression.getChildren().filter(se => se.kind == ts.SyntaxKind.SyntaxList).map(se => {
        //Visit every SyntaxList on the callExpressions.

        //This will not exist in default scenarios.
        const objLiteral = se.getChildren().find(c => ts.isObjectLiteralExpression(c));

        if (objLiteral) {
            const objLiteralSyntax = objLiteral.getChildren().find(c => c.kind == ts.SyntaxKind.SyntaxList);

            //Return empty string if there is no object literal.
            if(!objLiteralSyntax) {
                return '';
            }

            const propAssignments = objLiteralSyntax.getChildren().filter(c => ts.isPropertyAssignment(c));

            let str = '';

            propAssignments.forEach(prop => {
                const ident = prop.getChildren().find(c => ts.isIdentifier(c));
                if (ident.getText() == 'permissions') {
                    str += '\n\tPERMISSIONS\n' + parsePermissionAssignment(prop, ident.getText());
                }
                else if (ident.getText() == 'assert') {
                    str += '\n\t ASSERT\n';
                }
                else if (ident.getText() == 'edge') {
                    //TODO: parse edge.
                }
                else if (ident.getText() == 'name') {
                    const stringLit = prop.getChildren().find(c => ts.isStringLiteral(c));
                    trueName = stringLit.getText().replaceAll(`'`, '');
                }
            });

            return str.slice(0, -1) + ';';
        }
    }).join(''), trueName]
}

//Parses the right-hand side of the 'permission' field.
function parsePermissionAssignment(prop: ts.Node, type: string): string {
    const arrowFn = prop.getChildren().find(c => ts.isArrowFunction(c));

    if (!arrowFn) {
        throw new Error(`The permission decorator for ${type} in ${prop.getSourceFile().fileName} on line ${prop.getStart()} is not an arrow function.`);
    }

    const parenExpr = arrowFn.getChildren().find(c => ts.isParenthesizedExpression(c));
    const arr = arrowFn.getChildren().find(c => ts.isArrayLiteralExpression(c));

    //Verify that the array is a direct child of the arrowFn, and not the parenExpression itself.
    if (!parenExpr && !arr) {
        throw new Error(`The permission decorator for ${type} in ${prop.getSourceFile().fileName} on line ${prop.getStart()} does`);
    }

    //The object literal mapping of each property to its corresponding value.
    const objectLit = parenExpr?.getChildren().find(c => ts.isObjectLiteralExpression(c));
    const objectSyntax = objectLit?.getChildren().find(c => c.kind == ts.SyntaxKind.SyntaxList);


    return objectSyntax.getChildren().filter(c => ts.isPropertyAssignment(c)).map(prop => {
        const ident = prop.getChildAt(0);

        //Value can be TrueKeyword, FalseKeyword, string, Identifier (reference), or BinaryExpression which is a composite.
        const value = prop.getChildAt(2);

        if (value.kind == ts.SyntaxKind.TrueKeyword) {
            return `FOR ${ident.getText().toUpperCase()} FULL`;
        }
        else if (value.kind == ts.SyntaxKind.FalseKeyword) {
            return `FOR ${ident.getText().toUpperCase()} NONE`
        }
        else if (value.kind == ts.SyntaxKind.StringLiteral) {
            return `FOR ${ident.getText().toUpperCase()} WHERE ${sanitizeText(value.getText())}`
        }
        else if (value.kind == ts.SyntaxKind.Identifier) {
            const pos = ts.GoToDefinition.getDefinitionAndBoundSpan(program, value.getSourceFile(), value.getStart());

            const identSrc = program.getSourceFile(pos?.definitions[0].fileName);
            const declaration = getDeclaration(identSrc, value.getText());

            //Get the object literal off declaration.
            const objLit = declaration.getChildren().find(c => ts.isObjectLiteralExpression(c));
            const syntaxList = objLit?.getChildren().find(c => c.kind == ts.SyntaxKind.SyntaxList);
            const propAssignments = syntaxList?.getChildren().filter(c => ts.isPropertyAssignment(c));

            let scopeName;

            propAssignments.forEach(prop => {
                let name = prop.getChildAt(0).getText();
                let value = prop.getChildAt(2).getText();

                if (name == 'name') {
                     scopeName = value;
                }
            });
            
            if(scopeName) {
                return `FOR ${ident.getText().toUpperCase()} WHERE $scope = ${scopeName}`;
            }

            //Handle sub queries
        }   
        else if (value.kind == ts.SyntaxKind.BinaryExpression) {
            return `FOR ${ident.getText().toUpperCase()} WHERE ${parseBinaryExpression(value)}`;
        }
        else {

        }

        return '';

        //Filter will properly format the result returned by this function.
    }).filter(x => x != '').map(v => `\t\t${v},`).join('\n');
}

function sanitizeText(n: string) {
    return n.replaceAll('===', '==')
        .replaceAll('\'', '').replaceAll('null', 'NULL');
}