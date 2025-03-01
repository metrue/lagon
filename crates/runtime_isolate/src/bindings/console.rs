use log::{debug, error, info, warn};

use crate::Isolate;

pub const CONSOLE_SOURCE: &str = "console";

pub fn console_binding(
    scope: &mut v8::HandleScope,
    args: v8::FunctionCallbackArguments,
    mut _retval: v8::ReturnValue,
) {
    let level = args.get(0).to_rust_string_lossy(scope);
    let message = args.get(1).to_rust_string_lossy(scope);
    let state = Isolate::state(scope);
    let state = state.borrow();

    if let Some((deployment, function)) = &state.metadata.as_ref() {
        let deployment = deployment.as_str();
        let function = function.as_str();

        match level.as_str() {
            "debug" => {
                debug!(source = CONSOLE_SOURCE, deployment = deployment, function = function; "{}", message)
            }
            "warn" => {
                warn!(source = CONSOLE_SOURCE, deployment = deployment, function = function; "{}", message)
            }
            "error" => {
                error!(source = CONSOLE_SOURCE, deployment = deployment, function = function; "{}", message)
            }
            _ => {
                info!(source = CONSOLE_SOURCE, deployment = deployment, function = function; "{}", message)
            }
        };
    }
}
