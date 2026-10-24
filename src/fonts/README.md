# Arrow glyph subsets

`inter-arrow-400-normal.woff2` and `inter-arrow-600-normal.woff2` each contain one glyph, U+2192 (right arrow). The
`@fontsource/inter` subsets have no U+2192, so without these the PDF would embed a system fallback font (REQ-012).

- Source: `inter-ui` 3.19.3 (npm), files `Inter (web)/Inter-Regular.woff2` (400) and `Inter-SemiBold.woff2` (600).
- Command (fonttools + brotli), once per weight:

  ```
  pyftsubset "Inter (web)/Inter-Regular.woff2" --unicodes=U+2192 --flavor=woff2 --layout-features= \
    --output-file=inter-arrow-400-normal.woff2 --name-IDs='*'
  ```

  (SemiBold for 600.)
- Licence: SIL Open Font License 1.1, copyright The Inter Project Authors. Inter has no Reserved Font Name, so the
  subset may keep the name.
- Declared in `src/style.css` as extra `Inter` `@font-face` rules with `unicode-range: U+2192`.
