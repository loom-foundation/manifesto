#!/usr/bin/env python3
"""Insert (or refresh) a `verification:` block in a Mill signature file.

The block is the durable, committed record of which org insider signed, how
they were verified, and when. It is stamped by the record-signatures workflow
after merge and is never hand-written; all facts arrive via the environment so
this script only performs the YAML-frontmatter surgery. Re-running is
idempotent: an existing `verification:` block is stripped before the fresh one
is written.
"""
import os
import sys


def main() -> int:
    path = sys.argv[1]
    signed_by = os.environ["SIGNED_BY"]
    org = os.environ["ORG"]
    membership = os.environ["MEMBERSHIP"]
    verified_via = os.environ.get("VERIFIED_VIA", "")
    signed = os.environ["SIGNED"]

    with open(path, encoding="utf-8") as fh:
        lines = fh.read().split("\n")

    # A signature file must open with YAML frontmatter; if it doesn't, leave it be.
    if not lines or lines[0].strip() != "---":
        return 0
    close = next((i for i in range(1, len(lines)) if lines[i].strip() == "---"), None)
    if close is None:
        return 0

    # Strip any prior `verification:` block (top-level key + its indented body).
    kept, skipping = [], False
    for ln in lines[1:close]:
        if ln.startswith("verification:"):
            skipping = True
            continue
        if skipping:
            if ln.strip() == "" or ln[:1] in (" ", "\t"):
                continue
            skipping = False
        kept.append(ln)
    while kept and kept[-1].strip() == "":
        kept.pop()

    block = [
        "verification:",
        f"  signed-by: {signed_by}",
        f"  org: {org}",
        f"  org-membership: {membership}",
    ]
    if verified_via:
        block.append(f"  verified-via: {verified_via}")
    block.append(f"  signed: {signed}")

    new = ["---"] + kept + block + ["---"] + lines[close + 1:]
    with open(path, "w", encoding="utf-8") as fh:
        fh.write("\n".join(new))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
