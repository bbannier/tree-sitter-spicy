//! This crate provides a Spicy grammar for the [tree-sitter][] parsing library.
//!
//! Typically, you will use the [`language_spicy`][language func] function to add this grammar to a
//! tree-sitter [Parser][], and then use the parser to parse some code:
//!
//! ```
//! use tree_sitter::Parser;
//!
//! let code = r#"
//!     module foo;
//!     global x = 10;
//!     print x;
//! "#;
//! let mut parser = Parser::new();
//! parser
//!     .set_language(tree_sitter_spicy::language_spicy())
//!     .expect("Error loading Spicy grammar");
//! let parsed = parser.parse(code, None).unwrap();
//! let root = parsed.root_node();
//! assert!(!root.has_error());
//! ```
//!
//! [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
//! [language func]: fn.language_spicy.html
//! [Parser]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Parser.html
//! [tree-sitter]: https://tree-sitter.github.io/

use tree_sitter::Language;

extern "C" {
    fn tree_sitter_spicy() -> Language;
}

/// Returns the tree-sitter [Language][] for Spicy.
///
/// [Language]: https://docs.rs/tree-sitter/*/tree_sitter/struct.Language.html
#[must_use]
pub fn language_spicy() -> Language {
    unsafe { tree_sitter_spicy() }
}

// /// The syntax highlighting query for this language.
// pub const HIGHLIGHT_QUERY: &str = "";

// /// The local-variable syntax highlighting query for this language.
// pub const LOCALS_QUERY: &str = "";

// /// The symbol tagging query for this language.
// pub const TAGGING_QUERY: &str = "";

/// The content of the [`node-types.json`][] file for this grammar.
///
/// [`node-types.json`]: https://tree-sitter.github.io/tree-sitter/using-parsers#static-node-types
pub const NODE_TYPES: &str = include_str!(concat!(env!("OUT_DIR"), "/src/node-types.json"));

#[cfg(test)]
mod tree_sitter_tests {
    use std::process::{Command, Stdio};

    type Result<T> = std::result::Result<T, std::io::Error>;

    #[test]
    fn run() -> Result<()> {
        Command::new("tree-sitter")
            .arg("generate")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()?;

        Command::new("tree-sitter")
            .arg("test")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()?;

        Ok(())
    }
}
