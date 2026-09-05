> Current branch note: refer to PRODUCT_SPEC.md, CONTENT_MODEL.md, QUALITY_GATE.md and RELEASE.md for current behavior and validation. Earlier measurements below are historical and are not evidence for the new branch.

# Content completeness matrix

Validated by `npm run content:validate` and `npm run i18n:check`.

| Collection | Count | RU | EN | Structured | Sources / review |
| --- | ---: | :---: | :---: | :---: | :---: |
| Methods | 16 | ✓ | ✓ | ✓ | ✓ |
| Templates | 47 | ✓ | ✓ | ✓ | Context guidance |
| Playbooks | 39 | ✓ | ✓ | ✓ | Related practice |
| Knowledge domains | 26 | ✓ | ✓ | ✓ | Registry-linked |
| Glossary | 172 | ✓ | ✓ | ✓ | Where appropriate |
| Decision tools | 8 | ✓ | ✓ | Pure functions | Assumptions shown |

Checks reject missing minimum counts, empty locale values, and placeholder markers.
