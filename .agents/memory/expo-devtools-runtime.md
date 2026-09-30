---
name: Expo DevTools runtime limitation
description: Distinguishes a missing native DevTools library from an Expo app startup failure.
---

If the Expo workflow reports that React Native DevTools could not install because `libglib-2.0.so.0` is missing, check whether Metro completes its bundle and the app preview loads before treating the warning as a blocker.

**Why:** In this NixOS environment, the DevTools binary can fail to load while Expo Metro and the app continue serving normally.

**How to apply:** Only investigate the missing library if the user needs the debugger itself; otherwise verify the bundle and preview, then continue.