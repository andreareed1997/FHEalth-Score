"use client";

// Polyfill for Node.js globals in browser
if (typeof window !== "undefined") {
  // @ts-expect-error - polyfill global
  window.global = window.globalThis || window;
  
  // @ts-expect-error - polyfill process
  window.process = window.process || { env: {} };
  
  // @ts-expect-error - polyfill Buffer
  if (typeof window.Buffer === "undefined") {
    window.Buffer = {
      isBuffer: () => false,
      from: () => new Uint8Array(),
      alloc: () => new Uint8Array(),
    } as unknown as typeof Buffer;
  }
}

export {};

