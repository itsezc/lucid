import * as ts from 'byots';
import { program } from './entry';
import { getDeclaration, recurseToDepth } from './util';
import { extrapolateTableName } from '../util';

//TODO: refactor so that this function can parse any field node, even a TypeLiteral, ArrayType, or Identifier
export function parseField(n: ts.Node, tableName: string, baseName = ''): string {
    const sl = n.getChildren().find(n => n.kind == ts.SyntaxKind.SyntaxList);
    const dec = sl?.getChildren().find(n => ts.isDecorator(n));

    if (dec) {
        //Parse decorator for permissions and other information.
    }

    const optional = n.getChildren().find(n => n.kind == ts.SyntaxKind.QuestionToken);
    const required = n.getChildren().find(n => n.kind == ts.SyntaxKind.ExclamationToken);

    //Whether we have a type literal or not.

    //! and ? can only be used in a Class, not an anonymous object.
    if (!optional && !required && baseName == '') {
        console.error(`Cannot parse field ${n.getText()}. Field must be either optional or required, annotated with ! or ? respectively.`);
        process.exit();
    }

    const ident = n.getChildren().find(n => ts.isIdentifier(n));

    let isFlexible = false;
    let fieldName = baseName + ident?.getText();
    let fieldType = 'string';

    const primitiveTypes = {
        'string': 'string',
        'Decimal': 'decimal',
        'Float': 'float',
        'Date': 'datetime',
        'DateTime': 'datetime',
        'number': 'int',
        'boolean': 'bool',
        'GeoPoint': 'point',
        'GeoMultiPoint': 'multipoint',
        'GeoLine': 'line',
        'GeoMultiLine': 'multiline',
        'GeoPolygon': 'polygon',
        'GeoMultiPolygon': 'multipolygon',
        'GeoCollection': 'collection',
        'typeLiteral': 'object'
    };

    let subFields = [];

    n.getChildren().forEach(child => {
        if (child.kind == ts.SyntaxKind.TypeLiteral) {
            const sl = child.getChildren().find(n => n.kind == ts.SyntaxKind.SyntaxList);
            const propSigs = sl?.getChildren().filter(n => ts.isPropertySignature(n));

            propSigs?.forEach(prop => {
                //For each inline property defined here, create a nested type and append to field.
                //subFields.push(parseField(prop, tableName, ''));

                const val = parseField(prop, tableName, ident.getText() + '.');

                if (val) {
                    subFields.push(val);
                }
            });

            fieldType = 'object';
        }
        else if(primitiveTypes[child.getText()]) {
            fieldType = primitiveTypes[child.getText()];
        }
        else if (child.kind == ts.SyntaxKind.ArrayType && baseName == '') {
           fieldType = 'array';

           //Get TypeLiteral children of the arraytype.
            const tl = child.getChildren().find(n => n.kind == ts.SyntaxKind.TypeLiteral);
            if(tl) {
                subFields.push(parseField(tl, tableName, '.*'));
            }
            else {
                subFields.push(parseField(n, tableName, '.*'));
            }
        }
        else if (child.kind == ts.SyntaxKind.TypeReference) {
            if (!primitiveTypes[child.getText()]) {
                //Type isn't primitive, so continue.

                const sourcePosition = ts.GoToDefinition.getDefinitionAndBoundSpan(program, child.getSourceFile(), child.getStart());
                const identSrc = program.getSourceFile(sourcePosition?.definitions[0].fileName);
                const declaration = getDeclaration(identSrc, child.getText());
  
                fieldType = extrapolateTableName(child.getText());
                
                if (declaration) {
                    const declarationIdentifier = declaration?.getChildren().find(n => ts.isIdentifier(n));
                    const declaration_sl = declaration?.getChildren().find(n => n.kind == ts.SyntaxKind.SyntaxList);
                    const decorator = declaration_sl?.getChildren().find(n => ts.isDecorator(n));
    
                    console.log(decorator?.getText());
                    const decorator_ce = decorator?.getChildren().find(n => ts.isCallExpression(n));
                    const decorator_ce_sl = decorator_ce?.getChildren().find(n => n.kind == ts.SyntaxKind.SyntaxList);
                    const decorator_ce_sl_ol = decorator_ce_sl?.getChildren().find(n => n.kind == ts.SyntaxKind.ObjectLiteralExpression);
                    const decorator_ce_sl_ol_sl = decorator_ce_sl_ol?.getChildren().find(n => n.kind == ts.SyntaxKind.SyntaxList);
                    const decorator_ce_sl_ol_sl_pa = decorator_ce_sl_ol_sl?.getChildren().filter(n => ts.isPropertyAssignment(n));

                    decorator_ce_sl_ol_sl_pa.forEach(pa => {
                        const ident = pa.getChildren().find(n => ts.isIdentifier(n));
                        if (ident.getText() == 'name') {
                            const string = pa.getChildren().find(n => ts.isStringLiteral(n));
                            fieldType = `record(${string.getText().replaceAll('"', '').replaceAll("'", '')})`;
                        }
                    });
                }

            }

        }
    });

    if (dec) {
        recurseToDepth((n: ts.Node) => {
            if(ts.isPropertyAssignment(n)) {
                // The identifer in this property assignment.
                const ident = n.getChildren().find(n => ts.isIdentifier(n));

                // console.log(ident.getText());

                switch (ident.getText()) {
                    case 'flexible':
                        if (n.getChildren().find(n => n.kind == ts.SyntaxKind.TrueKeyword)) 
                            isFlexible = true;
                        break;

                    case 'name':
                        if (n.getChildren().find(n => n.kind === ts.SyntaxKind.StringLiteral))
                            fieldName = n.getChildren().find(n => n.kind === ts.SyntaxKind.StringLiteral).getText().replaceAll('"', '').replaceAll("'", '');
                        break;
                
                    default:
                        break;
                }
            }

            return;
        }, dec, 5);
    }

    // const deccx = dec.getChildren().find(x => ts.isCallExpression(x));
    // const deccxsl = deccx.getChildren().find(x => )

    let fieldSchema = `DEFINE FIELD ${fieldName} ON TABLE ${tableName} ${isFlexible ? 'FLEXIBLE TYPE' : 'TYPE'} ${fieldType}`;

    //TODO: discover why these nested objects are not inserted correctly.

    fieldSchema += (subFields.length > 0 ? '\n': '') + subFields.join('\n');

    // console.log('NEW: ', fieldSchema);

    return fieldSchema;
}
