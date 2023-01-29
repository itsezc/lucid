import { tsquery } from '@phenomnomnominal/tsquery';
import * as ts from 'typescript';

export function parseScope(scope: ts.VariableDeclaration) {
    const name = (tsquery(scope, 'ObjectLiteralExpression > PropertyAssignment:has(Identifier[name="name"]) > StringLiteral')[0] as ts.StringLiteral).text;
    const timeout = (tsquery(scope, 'ObjectLiteralExpression > PropertyAssignment:has(Identifier[name="session"]) > StringLiteral')[0] as ts.StringLiteral).text;

    const signinBlock = tsquery(scope, 'ObjectLiteralExpression > PropertyAssignment:has(Identifier[name="signin"]) > ArrowFunction > Block')[0] as ts.Block;
    
    const signupBlock = tsquery(scope, 'ObjectLiteralExpression > PropertyAssignment:has(Identifier[name="signup"]) > ArrowFunction > Block')[0] as ts.Block;


    const signinSQL = tsquery(signinBlock, 'ReturnStatement > CallExpression > StringLiteral')[0] as ts.StringLiteral;
    let signupSQL: ts.StringLiteral | ts.NoSubstitutionTemplateLiteral = tsquery(signupBlock, 'ReturnStatement > CallExpression > StringLiteral')[0] as ts.StringLiteral;

    if (!signupSQL) {
        signupSQL = tsquery(signupBlock, 'ReturnStatement > CallExpression > NoSubstitutionTemplateLiteral')[0] as ts.NoSubstitutionTemplateLiteral;
    }

    return `DEFINE SCOPE ${name} SESSION ${timeout} \n SIGNUP (${signupSQL?.text})\n SIGNIN (${signinSQL?.text});`;
}