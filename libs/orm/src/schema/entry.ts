import * as ts from 'typescript';
import { parseTable } from './table';
import { tsquery } from '@phenomnomnominal/tsquery';
import { command, run, positional, optional, option } from 'cmd-ts';
import { Directory, File } from 'cmd-ts/batteries/fs';
import { Url } from 'cmd-ts/batteries/url';
import { writeFileSync} from 'fs';


const cmd = command({
    name: 'SQLSG',
    description: 'Generates SurrealQL schemas from typescript source files.',
    version: '0.0.1',
    args: {
        project: positional({ type: Directory, displayName: 'The project to generate a schema for.'}),
        output: positional({
            type: optional(File),
            displayName: 'The file to output the schema to.'
        }),
        url: positional({
            type: optional(Url),
            displayName: 'The database URL. If left blank, schema will not be applied to the database.'
        })
    },  
    handler: (args) => {
        //Go into the directory of this project.
        process.chdir(args.project);

        generateSchema();

        if (args.output) {
            //Write the schema to the specified file.
            writeFileSync(args.output, generateSchema());
        }

        if (args.url) {
            //The schema needs to be applied to the database as a commit.
            
        }
    }
});

run(cmd, process.argv.slice(2));




export let checker: ts.TypeChecker | null;
export let program: ts.Program | null;

//Generates a full SurrealQL Schema for the project at the specified directory.
function generateSchema(): string {
    const cfgFile = ts.findConfigFile(process.cwd(), ts.sys.fileExists, 'tsconfig.json');
    const { config } = ts.readConfigFile(cfgFile, ts.sys.readFile);

    //Do not emit JS into the user's project directory.
    config.compilerOptions.noEmit = true;

    const { options, fileNames, errors } = ts.parseJsonConfigFileContent(config, ts.sys, process.cwd());

    program = ts.createProgram(fileNames, options);
    checker = program.getTypeChecker();

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
        console.error('Cannot generate a schema for a project with active Typescript errors!\n  ' + message);
        process.exit();
    }


    //The resulting schema in its entirety.
    const resultSchema = program.getSourceFiles().map(sf => parseSourceFile(sf)).filter(n => n != '').join('\n');

    return resultSchema;
}


//Parse a source file in its entirety and returns a SurrealQL Schema as a string.
function parseSourceFile(src: ts.SourceFile): string {
    //Pick out all ClassDeclarations with the 'Table' decorator.
    const tableDeclarations = tsquery(src, 'ClassDeclaration:has(Identifier[name="Table"])');

    //Since every Table results in at least one query, we do not need to filter out empty strings.
    return tableDeclarations.map(td => parseTable(td)).join('\n');
}

