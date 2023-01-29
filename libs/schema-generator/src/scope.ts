import { tsquery } from '@phenomnomnominal/tsquery';
import * as ts from 'typescript';

export function parseScope(scope: ts.VariableDeclaration) {
    const name = (tsquery(scope, 'ObjectLiteralExpression > PropertyAssignment:has(Identifier[name="name"]) > StringLiteral')[0] as ts.StringLiteral).text;
    const timeout = (tsquery(scope, 'ObjectLiteralExpression > PropertyAssignment:has(Identifier[name="timeout"]) > StringLiteral')[0] as ts.NumericLiteral).text;
    
}