import * as ts from 'typescript';
import { tsquery } from '@phenomnomnominal/tsquery';
import { parseField } from './field';
import { toSnakeCase } from '../util';
import { parseExpression } from './expression';

//Parses a single Typescript AST table node and returns a SurrealQL Schema for the table itself and its fields.
export function parseTable(table: ts.Node): string {
    //Grab the 'Table' decorator (if it exists), and its corresponding ObjectLiteral inside.
    const decorator = tsquery(table, 'Decorator:has(Identifier[name="Table"])')[0];


    //Generate name if it does not exist in the decorator.
    const implicitTableName = toSnakeCase(tsquery(table.parent, 'ClassDeclaration > Identifier')[0]?.getText());


    let [decoratorSchema, tableName] = parseTableDecorator(decorator);

    if(!tableName) {
        tableName = implicitTableName;
    }

    //Parse each field according
    const fields = tsquery(table, 'PropertyDeclaration').map(property => parseField(property as ts.PropertyDeclaration, tableName));

    return `DEFINE TABLE ${tableName} SCHEMAFULL;${decoratorSchema ? '\n': ''}${decoratorSchema ?? ''}${fields.join('')}`;
}

//Parses and returns the decorator for the table.
function parseTableDecorator(decorator: ts.Node): [string | null, string | null] {
    let decoratorSchema = '';

    //Get the TableName assigned in the decorator, if it exists.
    const decoratorBody = tsquery(decorator, 'CallExpression > ObjectLiteralExpression')[0];

    if(!decoratorBody) {
        //This is an empty decorator.
        return [null, null];
    }

    const tableName = tsquery(decoratorBody, 'PropertyAssignment:has(Identifier[name="name"]) > StringLiteral')[0]?.getText()
        //Remove the quotes from the string.
        .replaceAll('"', '')
        .replaceAll("'", '');
    
    //Get the permissions AST on this decorator (if it exists).
    const perms = tsquery(decorator, 'ObjectLiteralExpression > PropertyAssignment:has(Identifier[name="permissions"]) > ArrowFunction > ParenthesizedExpression > ObjectLiteralExpression')[0];

    if (perms) {
        decoratorSchema += `\tPERMISSIONS`;
        tsquery(perms, 'PropertyAssignment')?.forEach(prop => { 
            const propAssign = prop as ts.PropertyAssignment;
    
            const propName = propAssign.name.getText();
            const propValue = propAssign.initializer;
            decoratorSchema += `\n\t\tFOR ${propName.toUpperCase()} `;
            if (propValue.kind === ts.SyntaxKind.TrueKeyword) {
                decoratorSchema += 'FULL';
            }
            else if (propValue.kind === ts.SyntaxKind.FalseKeyword) {
                decoratorSchema += 'NONE';
            }
            else {
                decoratorSchema += parseExpression(propValue);
            }

            decoratorSchema += ',';
        });

    }



    //These will only pick out 'TrueKeyword' since they are false by default.
    const auditable = tsquery(decorator, 'PropertyAssignment:has(Identifier[name="auditable"]) > TrueKeyword')?.length > 0;
    const edge = tsquery(decorator, 'PropertyAssignment:has(Identifier[name="edge"]) > TrueKeyword')?.length > 0;

    //Returns the tableName and the Schema corresponding to the decorator.
    return [decoratorSchema, tableName]
}
