# XINOBI U portable accepted fixture package

This package is an exact byte copy of the current accepted records. It does not generate masks or modify acceptance records. It contains CM101 (101/103/104/105), CM121 (121/122/123), and EC501 (501).

## Safe installation

Validate and print the plan without writing files:

    node tools/import-xinobi-u-fixtures.cjs

Apply on a clean clone or empty App_Data target:

    node tools/import-xinobi-u-fixtures.cjs --apply

If an existing catalog state is missing only these products or variants, explicitly allow additive merge:

    node tools/import-xinobi-u-fixtures.cjs --apply --merge-catalog

The importer never overwrites a file with a different SHA-256; it stops on a conflict. Default target is services/api/App_Data. Use --target for an isolated test directory.

## Contents

- Each variant active mask.png, branding.png, acceptance.json, and current.json copy.
- Variant source images and the three product family originalImage images.
- A catalog-state.fragment.json containing only the three required families and the eight packaged approved variants.
- File sizes and SHA-256 values in manifest.json.

Cloudflare tokens, User Secrets, AI session records, customer patterns, logs, artifacts output, and the rest of App_Data are not included.

Source photos are local catalog media supplied by the product owner. Confirm redistribution rights before sharing outside the repository.
