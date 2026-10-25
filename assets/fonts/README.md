# Manrope Latin + Cyrillic

This 32,296-byte RU subset uses the same Manrope 4.504 design as the installed Fontsource files. EN keeps the package's smaller Latin subset. No runtime font requests leave the origin.

Source: https://github.com/google/fonts/blob/8f9a401dbb3793e0d1264b15d96aa253f05280f5/ofl/manrope/Manrope%5Bwght%5D.ttf

Source SHA-256: `d0639be45d0af36e798172419d7bd173c4bd4f29e2b76cbb69db1d11bf8b0a40`.
Output SHA-256: `c6a22272d207c90622e593d2a8db7a8fecf0621015ab92b62d6dae261b1afddd`.

Reproduce with `python scripts/build-manrope-subset.py` after installing `fonttools[woff]==4.66.1` and the locked npm dependencies. The script verifies the pinned upstream bytes, reference version, 2,261 glyph outline/advance-width comparisons and the exact output digest before writing. The resulting variable file preserves weights 200–800 and all 317 codepoints in the union of the existing Latin/Cyrillic subsets. See OFL.txt for the license.
