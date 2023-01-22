import * as ts from 'byots';


//TODO: refactor so that this function can parse any field node, even a TypeLiteral, ArrayType, or Identifier
export function parseField(n: ts.Node, tableName: string, baseName = '', typeLit = false): string {
    const sl = n.getChildren().find(n => n.kind == ts.SyntaxKind.SyntaxList);
    const dec = sl?.getChildren().find(n => ts.isDecorator(n));

    if (dec) {
        //Parse decorator for permissions and other information.
    }

    const optional = n.getChildren().find(n => n.kind == ts.SyntaxKind.QuestionToken);
    const required = n.getChildren().find(n => n.kind == ts.SyntaxKind.ExclamationToken);

    //Whether we have a type literal or not.

    //! and ? can only be used in a Class, not an anonymous object.
    if (!optional && !required && !typeLit) {
        console.error(`Cannot parse field ${n.getText()}. Field must be either optional or required, annotated with ! or ? respectively.`);
        process.exit();
    }

    const ident = n.getChildren().find(n => ts.isIdentifier(n));

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
                subFields.push(parseField(prop, tableName, ident.getText() + '.', true));
            });

            fieldType = 'object';
        }
        if(primitiveTypes[child.getText()]) {
            fieldType = primitiveTypes[child.getText()];
        }
        else {
            //Either an Array, Object, or Identifier that must be resolved. Type will not be provided yet.

            if (child.kind == ts.SyntaxKind.ArrayType) {
                //Resolve underlying type to define schema on arr.* 
            }
            else if (child.kind == ts.SyntaxKind.Identifier) {
                //This is a user type that we must resolve, or a table reference (must be resolved).
            }
        }
    });

    // bool (SQL) boolean

    let fieldSchema = `DEFINE FIELD ${baseName + ident.getText()} ON TABLE ${tableName} TYPE ${fieldType}`;

    //TODO: discover why these nested objects are not inserted correctly.
    fieldSchema += subFields.length > 0 ? '\n': '' + subFields.join('\n');

    return fieldSchema;
}
