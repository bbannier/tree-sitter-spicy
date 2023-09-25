module.exports = grammar({
  name: "spicy",

  // This is borrowed from the Python grammar,
  // https://github.com/tree-sitter/tree-sitter-python/blob/master/grammar.js.
  extras: $ => [
    $.comment,
    $.BTEST,
    $.preprocessor,
    /[\s\f\uFEFF\u2060\u200B]|\\\r?\n/,
  ],

  rules: {
    module: $ =>
      field(
        "entities",
        repeat(choice($._decl, $.import, seq($.attribute, ";"), $.statement)),
      ),

    // Make this higher precedence than `statement` so we match a top-level decls directly.
    _decl: $ =>
      prec(
        1000,
        choice(
          $.module_decl,
          $.var_decl,
          $.enum_decl,
          $.struct_decl,
          $.type_decl,
          $.function_decl,
          $.hook_decl,
        ),
      ),

    module_decl: $ => seq("module", field("name", $.ident), ";"),

    function_decl: $ =>
      seq(
        optional($.visibility),
        "function",
        field("name", $.ident),
        "(",
        optional(commaSep1(seq(optional($.inout), $.ident, ":", $.typename))),
        ")",
        optional(seq(":", field("returns", $.typename))),
        repeat($.attribute),
        choice($.block, ";"),
      ),

    linkage: _ => choice("local", "global", "const", "var"),

    const: _ => "const",

    var_decl: $ =>
      seq(
        optional($.visibility),
        $.linkage,
        field("name", $.ident),
        optional(seq(":", field("type_", $.typename))),
        optional($.optional),
        optional(seq("=", field("init", $.expression))),
        optional($.attribute),
        ";",
      ),

    type_decl: $ =>
      seq(
        optional($.visibility),
        "type",
        field("name", $.ident),
        "=",
        choice($._unit_decl, $.library_type, $.typename),
        ";",
      ),

    enum_decl: $ =>
      seq(
        optional($.visibility),
        "type",
        field("name", $.ident),
        "=",
        "enum",
        "{",
        optional(seq(commaSep1($.enum_label), optional(","))),
        "}",
        ";",
      ),

    enum_label: $ => seq(field("name", $.ident), optional(seq("=", $.integer))),

    struct_decl: $ =>
      seq(
        optional($.visibility),
        "type",
        field("name", $.ident),
        "=",
        "struct",
        "{",
        repeat($.field_decl),
        "}",
      ),

    library_type: $ => seq("__library_type", "(", $.string, ")"),

    _unit_decl: $ =>
      seq(
        "unit",
        optional($.params),
        "{",
        repeat(
          choice(
            seq($.attribute, ";"),
            field("field", $.field_decl),
            $.sink_decl,
            $.var_decl,
            $.hook_decl,
            $.unit_switch,
          ),
        ),
        "}",
        repeat($.attribute),
      ),

    params: $ =>
      seq(
        token("("),
        optional(
          commaSep1(
            seq(
              optional($.inout),
              $.ident,
              ":",
              $.typename,
              optional(seq("=", $.expression)),
            ),
          ),
        ),
        token(")"),
      ),

    unit_switch: $ =>
      seq(
        "switch",
        optional(seq("(", $.expression, ")")),
        "{",
        repeat($.unit_switch_case),
        "}",
        optional($.attribute),
        optional(seq("if", "(", $.expression, ")")),
        ";",
      ),

    unit_switch_case: $ =>
      prec.right(
        seq(
          optional(commaSep1(choice("*", $.expression))),
          "->",
          choice($.field_decl, seq("{", repeat($.field_decl), "}")),
        ),
      ),

    inout: _ => "inout",

    hook_decl: $ =>
      seq(
        "on",
        field("name", choice($.ident, $._hook)),
        repeat(choice($.is_debug, $.hook_priority)),
        choice(
          seq(
            optional(
              seq("(", optional(commaSep1(seq($.ident, ":", $.typename))), ")"),
            ),
            $.statement,
          ),
          $.foreach,
        ),
      ),

    is_debug: _ => "%debug",

    hook_priority: $ => seq("priority", "=", optional("-"), $.integer),

    field_decl: $ =>
      prec.right(
        seq(
          field("name", optional($.ident)),
          ":",
          field("skip", optional("skip")),
          field(
            "type_",
            choice(
              $.typename,
              $.vector,
              $.regexp,
              $.bitfield,
              $.bytes,
              $.function_call,
              $.array_access,
              $.void,
            ),
          ),
          field(
            "type_ctor_args",
            optional(seq("(", optional(commaSep1($.expression)), ")")),
          ),
          optional(token(seq("[", "]"))),
          field("attributes", repeat($.attribute)),
          optional(prec.left(seq("->", $.sink))),
          choice(";", optional(choice($.if, $.foreach, $.block))),
        ),
      ),

    sink: $ => seq($.self_id, ".", $.ident),
    sink_decl: $ => seq("sink", $.ident, ";"),

    optional: _ => "&optional",

    foreach: $ => seq("foreach", $.block),

    attribute: $ =>
      seq(
        field("attribute_name", $.attribute_name),
        optional(seq("=", field("attribute_value", $.expression))),
      ),

    visibility: _ => choice("public"),

    statement: $ =>
      prec(
        1,
        choice(
          choice($.block, seq($.expression, ";")),
          $.assert,
          $.throw_,
          $.print,
          $.return,
          $.unset,
          seq($.continue, ";"),
          seq($.break, ";"),
          $.while,
          $.for,
          $.if,
          $.switch,
          ";",
        ),
      ),

    import: $ => seq("import", $.ident, ";"),

    assign: $ =>
      prec.left(
        1,
        seq($.expression, choice("=", "+=", "-=", "*=", "/="), $.expression),
      ),

    binary_op: $ =>
      choice(
        prec.left(
          4,
          seq(
            field("lhs", $.expression),
            choice("<", "<=", "==", "!=", ">", ">="),
            field("rhs", $.expression),
          ),
        ),
        prec.left(
          3,
          seq(
            field("lhs", $.expression),
            choice(
              "+",
              "-",
              "*",
              "/",
              "%",
              "**",
              "&&",
              "||",
              "&",
              "|",
              "&",
              "<<",
              ">>",
              "^",
            ),
            field("rhs", $.expression),
          ),
        ),
      ),

    pre: $ => prec(5, seq(choice("++", "--"), $.expression)),

    post: $ => prec(6, seq($.expression, choice("++", "--"))),

    unary_op: $ => prec(5, seq(choice("-", "!", "~", "*"), $.expression)),

    len: $ => seq("|", $.expression, "|"),

    if: $ =>
      prec.left(
        2,
        seq(
          "if",
          "(",
          $.expression,
          ")",
          $.statement,
          optional(seq("else", $.statement)),
        ),
      ),

    while: $ =>
      prec.left(
        3,
        seq(
          "while",
          "(",
          choice($.expression, seq($.var_decl, $.expression)),
          ")",
          $.statement,
          optional(seq("else", $.statement)),
        ),
      ),

    contains: $ => prec.right(4, seq($.expression, "in", $.expression)),
    contains_not: $ => prec.right(4, seq($.expression, "!in", $.expression)),

    for: $ =>
      prec(2, seq("for", "(", $.ident, "in", $.expression, ")", $.statement)),

    continue: _ => "continue",
    break: _ => "break",

    switch: $ =>
      seq(
        "switch",
        seq(
          "(",
          choice($.expression, seq($.linkage, $.ident, "=", $.expression)),
          ")",
        ),
        "{",
        repeat($.case),
        "}",
      ),

    case: $ =>
      seq(
        choice("default", seq("case", commaSep1($.expression))),
        ":",
        $.statement,
      ),

    assert: $ =>
      seq(
        seq("assert", optional("-exception")),
        $.expression,
        optional(seq(":", $.string)),
        ";",
      ),

    throw_: $ => seq(token("throw"), $.expression, ";"),

    print: $ => seq("print", optional(commaSep1($.expression)), ";"),

    expression: $ =>
      prec(
        10,
        choice(
          $.self_id,
          $.dd,
          $.ident,
          $.integer,
          $.real,
          $.boolean,
          $.list,
          $.tuple,
          $.map,
          $.string,
          $.bytes,
          $.regexp,
          $.capture_group,
          $.struct_ctr,
          $.address,
          $.network,
          $.port,
          $.char,
          $.bitfield,
          $.assign,
          $.unary_op,
          $.binary_op,
          $.pre,
          $.post,
          $.len,
          choice($.contains, $.contains_not),
          $.cast,
          $.new,
          $.set_add,
          $.list_comp,
          $.function_call,
          $.type_member,
          $.type_member_call,
          $.array_access,
          $.type_member_checked,
          $.type_member_check,
          $.ternary,
          prec(2000, seq("(", $.expression, ")")),
        ),
      ),

    typename: $ =>
      prec(
        4000,
        seq(
          $.ident,
          repeat(
            seq(
              "<",
              commaSep1(
                seq(
                  optional(field("name", seq($.ident, ":"))),
                  field("type_", $.typename),
                ),
              ),
              ">",
            ),
          ),
          repeat(choice("&", "[]")),
        ),
      ),

    cast: $ => seq("cast", "<", $.ident, ">", "(", $.expression, ")"),

    new: $ => seq("new", $.expression),

    set_add: $ => seq("add", $.ident, "[", $.expression, "]"),

    list_comp: $ =>
      seq("[", $.expression, "for", $.ident, "in", $.expression, "]"),

    function_call: $ =>
      prec(
        1000,
        seq(
          field("name", $.ident),
          seq("(", optional(commaSep1($.expression)), ")"),
        ),
      ),

    return: $ => seq("return", optional($.expression), ";"),

    unset: $ => seq("unset", $.expression, ";"),

    type_member: $ =>
      prec.left(10000, seq($.expression, seq(".", $.type_member_ident))),

    type_member_ident: $ => $.ident,

    type_member_call: $ =>
      prec.left(
        1000,
        seq($.type_member, seq("(", optional(commaSep1($.expression)), ")")),
      ),

    array_access: $ => prec(1100, seq($.expression, "[", $.expression, "]")),

    type_member_checked: $ => prec(100, seq($.expression, ".?", $.ident)),

    type_member_check: $ => prec(100, seq($.expression, "?.", $.ident)),

    ternary: $ =>
      prec.left(50, seq($.expression, "?", $.expression, ":", $.expression)),

    block: $ => seq("{", repeat(choice($.statement, $.var_decl)), "}"),

    bitfield: $ =>
      seq(
        "bitfield",
        "(",
        $.integer,
        ")",
        "{",
        repeat(
          seq(
            $.ident,
            ":",
            seq(
              $.integer,
              optional(seq("..", $.integer)),
              optional($.attribute),
            ),
            ";",
          ),
        ),
        "}",
      ),

    dd: _ => "$$",
    self_id: _ => "self",
    ident: $ =>
      prec.left(
        seq(
          /[a-zA-Z_]|[a-zA-Z_][a-zA-Z_0-9]*[a-zA-Z_0-9]/,
          optional(seq("::", $.ident)),
        ),
      ),
    integer: _ => seq(optional("+"), choice(/\d+/, /0x[a-fA-F0-9]+(p\d+)?/)),
    real: _ =>
      seq(
        optional("+"),
        choice(/\d+\.\d+/, /0x[a-fA-F0-9]+\.[a-fA-F0-9]+(p\d+)?/, /\d+[eE]\d+/),
      ),
    boolean: _ => choice("True", "False"),
    bytes: _ => token(/b\"(\\.|[^\\"])*\"/), // We do not use `string` here since that it cannot appear in a token (NonTerminal).
    char: _ => /'.'/,

    void: _ => "void",

    vector: $ =>
      prec(
        100,
        choice(
          seq(choice($.typename, $.bytes), "[", $.expression, "]"),
          seq(
            "(",
            choice(
              seq($.typename, "(", optional(commaSep1($.expression)), ")"),
              prec.right(200, seq($.typename, repeat($.attribute))),
            ),
            ")",
            "[",
            optional($.integer),
            "]",
          ),
        ),
      ),

    string: _ => /\"(\\.|[^\\"])*\"/,

    address: $ => choice($._address4, $._address6),
    _address4: _ => /\d+\.\d+\.\d+\.\d+/,
    _address6: $ =>
      choice(
        token(seq("[", prec.left(sep1(/[a-fA-F0-9]+/, repeat1(":"))), "]")),
        seq("[", "::", $._address4, "]"),
      ),

    network: $ => prec(20, seq($.address, "/", /\d+/)),

    port: _ => /\d+\/(tcp|udp|icmp)/,

    attribute_name: _ => /[&|%][a-zA-Z_][a-zA-z-0-9|-]*/,
    _hook: $ =>
      choice(
        seq($.ident, seq(token(seq("::", "%")), $.ident)),
        seq("%", $.ident),
      ),

    list: $ => seq("[", optional(commaSep1($.expression)), "]"),
    tuple: $ =>
      prec(2, seq("(", optional(commaSep1($.expression)), optional(","), ")")),
    map: $ =>
      seq(
        "map",
        "(",
        optional(commaSep1(seq($.expression, ":", $.expression))),
        ")",
      ),

    regexp: _ => token(/\/(\\.|[^\\\/])*\//),
    capture_group: _ => token(/\$\d+/),

    struct_ctr: $ =>
      seq("[", commaSep1(seq($.struct_ctr_id, "=", $.expression)), "]"),
    struct_ctr_id: _ => /\$[a-zA-Z_]|\$[a-zA-Z_][a-zA-Z_0-9]*[a-zA-Z_0-9]/,

    // This is borrowed from the Python grammar,
    // https://github.com/tree-sitter/tree-sitter-python/blob/master/grammar.js.
    comment: _ => token(seq("#", /.*/)),

    // We match BTest control commands everywhere since they are present in the upstream tests.
    BTEST: _ => token(seq("@TEST", /.*/)),

    preprocessor: _ => token(choice(seq("@if", /.*/), "@endif")),
  },
});

function commaSep1(rule) {
  return sep1(rule, ",");
}

function sep1(rule, separator) {
  return seq(rule, repeat(seq(separator, rule)));
}
