import * as ts from 'byots';
import { parseDecorator } from './decorator';
import { parseField } from './field';
import { extrapolateTableName } from '../util';

//Parses a single Typescript AST node table and returns a SurrealQL Schema for the table itself and its fields.
export function parseTable(n: ts.Node): string {
    //Get the actual textual representation of 'n'.
    const tableIdent = n.getChildren().find(n => ts.isIdentifier(n)).getText();

    //TableDecorator.
    const tableDec = n.getChildren().filter(n => n.kind == ts.SyntaxKind.SyntaxList).map(n => n.getChildren().filter(n => ts.isDecorator(n))).flat().find(n => n.getChildren().find(n => ts.isCallExpression(n)).getChildren().find(n => ts.isIdentifier(n)).getText() == 'Table');

    const [decoratorSchema, tableName] = parseDecorator(tableDec);

    //An array of each field's SurrealQL definition.
    const fields = n.getChildren().filter(n => n.kind == ts.SyntaxKind.SyntaxList).map(n => n.getChildren().filter(n => ts.isPropertyDeclaration(n))).flat().map(n => parseField(n, tableName || extrapolateTableName(tableIdent))).join("\n");;

    //Define the table with its coresponding data, and the fields themselves.

    return `DEFINE TABLE ${tableName || extrapolateTableName(tableIdent)} SCHEMAFULL ${decoratorSchema}\n${fields}`.replaceAll('/\s{2,}*/', ' ')
}