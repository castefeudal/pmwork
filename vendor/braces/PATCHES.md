# PMWORK braces patch

This is the MIT-licensed `braces` 3.0.3 source with a PMWORK-maintained 3.0.4 security patch. It caps nested brace and parenthesis parsing at 100 levels and guards recursive AST walkers against caller-provided ASTs. The cap can be lowered with `options.maxDepth`, but cannot be raised above 100.

The patch addresses GHSA-vfj7-8cjw-p6xm / CVE-2026-93687 while upstream has no patched release. Remove this vendored package after an upstream fixed release is available and verified.
