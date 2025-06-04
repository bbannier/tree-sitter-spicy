(comment) @comment

(function_decl (ident) @function)
(hook_decl (ident) @function)
(function_arg (ident) @variable.parameter)
(type_decl (params (ident) @variable.parameter))

(field_decl (ident) @property)
(bitfield_field (ident) @property)

[
 "("
 ")"
 "["
 "]"
 "{"
 "}"
] @punctuation.bracket

(attribute_name) @tag
(typename (ident) @type)
(parameterized_type ([
 "iterator"
 "map"
 "optional"
 "result"
 "set"
 "tuple"
 "vector"
 "view"
]) @type)

(binary_op ([
 "<"
 "<="
 "=="
 "!="
 ">"
 ">="
 "+"
 "-"
 "*"
 "/"
 "%"
 "**"
 "&&"
 "||"
 "&"
 "|"
 "<<"
 ">>"
 "^"
]) @operator)
(unary_op ([
 "-"
 "!"
 "~"
 "*"
]) @operator)

(integer) @constant
(real) @constant
(regexp) @constant
(port) @constant
(char) @constant
(error_literal "error" @constant)
(null) @constant.builtin
(boolean) @constant.builtin

(self_id) @variable.builtin
(string) @string

(inout) @keyword
(is_skip) @keyword
(break) @keyword
(continue) @keyword
(stop) @keyword
(visibility) @keyword
[
 "module"
 "unit"
 "function"
 "local"
 "global"
 "const"
 "var"
 "type"
 "if"
 "else"
 "switch"
 "in"
 "return"
 "on"
 "throw"
 "cast"
 "new"
 "for"
 "while"
] @keyword
