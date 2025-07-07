(
 (regexp_pattern) @injection.content
 (#set! injection.language "regex")
)

(
 (string) @injection.content
 (#match? @injection.content "%")
 (#set! injection.language "printf")
)

(
 (comment_body) @injection.content
 (#match? @injection.content "@TEST-")
 (#set! injection.language "btest")
)

(
 (BTEST) @injection.content
 (#set! injection.language "btest")
)
