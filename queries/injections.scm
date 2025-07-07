(
 (regexp_pattern) @injection.content
 (#set! injection.language "regex")
)

(
 (string) @injection.content
 (#match? @injection.content "%")
 (#set! injection.language "printf")
)
