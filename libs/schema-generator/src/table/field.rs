use swc_ecma_visit::Visit;
use convert_case::{Casing, Case::Snake};

use crate::parser::{assert::Assertions, perms::Permissions};

#[derive(Default)]
pub struct Field {
	pub permissions: Option<Permissions>,
    pub asserts: Vec<Assertions>,
    pub flexible: bool,
    pub qualified_name: String,
    pub qualified_type: String
}


impl Visit for Field {

}