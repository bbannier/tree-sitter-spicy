(comment) @comment

(function_decl (ident) @function)
(hook_decl (ident) @function)
(function_arg (ident) @variable)
(type_decl (params (ident) @variable))
(var_decl
  (linkage) @keyword
  name: (_) @variable
  type_: (_)? @type
)

(expression
  (ident) @variable
)

(field_decl (ident) @variable)
(bitfield_field (ident) @property)

(type_decl
  "type" @keyword
  name: (_) @variable
)

(module_decl "module" @keyword (ident) @variable)

(function_call
  name: (_) @function
)

(statement
  (_
    [
     "assert"
     "delete"
     "print"
     "unset"
    ] @macro
  )
)

(hook_name) @event

[
 "("
 ")"
 "["
 "]"
 "{"
 "}"
] @punctuation

(attribute_name) @property
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

(binary_op . (_) . _ @keyword (_) .)

(unary_op . _ @keyword)

(integer) @number
(real) @number
(regexp) @regexp
(port) @number
(char) @string
(error_literal "error" @string)
(null) @keyword
(boolean) @number

(self_id) @variable
(type_member_ident) @variable

(string) @string

(inout) @keyword
(is_skip) @keyword
(break) @keyword
(continue) @keyword
(stop) @keyword
(visibility) @modifier
[
 "const"
 "var"
 "in"
 "on"
 "cast"
 "new"
] @keyword

[
 "struct"
 "unit"
 "function"
] @keyword

[
 "if"
 "else"
 "switch"
 "while"
 "return"
 "throw"
 "for"
] @keyword
