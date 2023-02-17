use std::path::PathBuf;

use swc_common::sync::Lrc;
use swc_common::{
    errors::{ColorConfig, Handler},
    FileName, SourceMap,
};
use swc_ecma_parser::{lexer::Lexer, Parser as swc_parse, StringInput, Syntax};
use clap::Parser;

use crate::class::parse_module;

mod class;

#[derive(Parser, Debug)]
struct Args {
    ///The directory containing the TS models to be parsed. 
    source_dir: PathBuf
}

fn main() {
    let cli = Args::parse();

    if !cli.source_dir.is_dir() {
        panic!("Source directory argument does not reference a directory!");
    }

    let start_time = std::time::Instant::now();
    let ts_files = collect_ts_files(&cli.source_dir);
    
    let cm: Lrc<SourceMap> = Default::default();
    let mut modules = vec![];

    for file in &ts_files {
        let fm = cm.load_file(&file).unwrap();
        let lexer = Lexer::new(
            Syntax::Typescript(Default::default()),
            Default::default(),
            StringInput::from(&*fm),
            None,
        );
        let mut parser = swc_parse::new_from(lexer);

        if let Ok(module) = parser.parse_module() {
            modules.push(module);
        }
    }

    let tables = modules.iter().map(| module | {
        parse_module(module)
    }).collect::<Vec<_>>();

    println!("Parsed {} modules in {:?}", modules.len(), start_time.elapsed());    

    //println!("{:#?}", &ts_files.iter().map(|f| f.as_path().to_str().unwrap()).collect::<Vec<&str>>())
}


//Collects all the ts files in the directory and returns them.
fn collect_ts_files(dir: &PathBuf) -> Vec<PathBuf> {
    let entries = std::fs::read_dir(dir).unwrap();

    let mut ts_files = vec![];

    for entry in entries {
        if let Some(entry) = entry.ok() {
            let path = entry.path();

            if path.is_dir() && path.file_name().unwrap() != "node_modules" {
                ts_files.extend(collect_ts_files(&path));
            } 
            else if path.extension().map_or(false, |ext| ext == "ts") {
                ts_files.push(path);
            }
        }
    }

    ts_files
}