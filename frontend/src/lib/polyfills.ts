"use client";

// Polyfill for Node.js globals in browser
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).global = (window as any).globalThis || window;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).process = (window as any).process || { env: {} };
}

export {};
