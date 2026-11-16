---
title: Fast, then clever
description: Search should answer before a shopkeeper looks up.
date: 2026-11-16
draft: false
---

The person searching is often standing in a shop. They will not wait for a language model to fix a typo.

At Badho I rebuilt search for retailers typing in Hindi and Hinglish. Hybrid search went from 9% to 28% of DAU, in under 100ms, with zero LLM calls.

Models still did work. They did it off the path, where a second does not matter. Matching a catalogue. Cleaning a name. A fast path with no model in it. A slow path where the model has to earn its place. That is how I want AI inside a product.
