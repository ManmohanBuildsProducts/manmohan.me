---
title: Fast, then clever
description: Search should answer before a shopkeeper looks up.
date: 2026-11-16
draft: false
---

The person searching is often standing in a shop. They will not wait for a language model to fix a typo.

At Badho I rebuilt search for retailers typing in Hindi and Hinglish. Local embeddings, a phonetic fallback, no model on the request. Hybrid search went from 9% to 28% of DAU, in under 100ms, with zero LLM calls.

The model still did work. It did it off the path, where a second does not matter. Matching a catalogue. Cleaning a name. Deterministic steps first, a model only where the rules ran out, a person when confidence was low. That split is how I want AI inside a product.
