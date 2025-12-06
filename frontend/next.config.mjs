import { createRequire } from "module";
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer, webpack }) => {
    // Polyfill for Node.js globals
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };

      // Provide global polyfills
      config.plugins.push(
        new webpack.ProvidePlugin({
          global: "globalThis",
        })
      );

      // Handle problematic dependencies
      config.resolve.alias = {
        ...config.resolve.alias,
        "pino-pretty": false,
        "@react-native-async-storage/async-storage": false,
      };
    }

    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      topLevelAwait: true,
      layers: true,
    };

    // Ignore specific modules that cause issues
    config.externals = config.externals || [];
    if (Array.isArray(config.externals)) {
      config.externals.push({
        "pino-pretty": "pino-pretty",
      });
    }

    return config;
  },
  // Remove COEP/COOP headers - they cause issues with wallet connections
  // WASM will still work without them in most modern browsers
};

export default nextConfig;

