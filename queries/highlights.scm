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

(parameterized_type
  "<"
  name: (_)? @variable
  ">"
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
(dd) @keyword

[
 "("
 ")"
 "["
 "]"
 "{"
 "}"
 "<"
 ">"
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

(integer) @number
(real) @number
(port) @number
(char) @string
(error_literal "error" @string)
(null) @keyword
(boolean) @number

; Highlight both the full regexp as well as the delimiters as regexp. This
; allows downstream consumers to inject different highlighting of the pattern,
; but still highlight the surrounding `/`.
(regexp "/" @regexp) @regexp

(self_id) @keyword
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
