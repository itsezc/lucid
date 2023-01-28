import { command, run, positional, optional, option } from 'cmd-ts';
import { Directory, File } from 'cmd-ts/batteries/fs';
import { Url } from 'cmd-ts/batteries/url';
import { writeFileSync } from 'fs';
import { generateSchema } from '@surreal-tools/schema-generator';
import { SurrealRest } from '@surreal-tools/client';

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
        const generatedOutput = generateSchema();

        if (args.output) {
            writeFileSync(args.output, generatedOutput);
        }

        if (args.url) {
            //The schema needs to be applied to the database as a commit.
        }
    }
});

run(cmd, process.argv.slice(2));