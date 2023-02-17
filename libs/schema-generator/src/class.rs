
use swc_ecma_ast::Module;
use swc_ecma_visit::{VisitWith, Visit};

pub fn parse_module(module: &Module) -> String {
    for item in module.body.iter() {
        item.visit_children_with(&mut ClassParser);
    }
    
    "Test".into()
}

struct Schema {

}


struct ClassParser;

impl Visit for ClassParser {
    fn visit_class_decl(&mut self, dec: &swc_ecma_ast::ClassDecl) {
        println!("Found class declaration!");
    }
}