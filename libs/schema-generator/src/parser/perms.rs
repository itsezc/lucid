use swc_ecma_visit::Visit;

#[derive(Default)]
pub struct Permissions {
    create: String,
    update: String,
    delete: String,
    select: String
}
