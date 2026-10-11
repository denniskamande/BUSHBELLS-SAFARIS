// The shared TanStack Start config registers the framework, React, Tailwind,
// TypeScript path, and deployment plugins. Add project-specific Vite settings below.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    optimizeDeps: {
      // Optimise the first-screen libraries together with React, rather than
      // discovering them after a preview has already loaded the old graph.
      include: [
        "@radix-ui/react-slot",
        "@tanstack/react-query",
        "@tanstack/react-router",
        "class-variance-authority",
        "clsx",
        "lucide-react",
        "tailwind-merge",
      ],
      // Reject outdated prebundles so Vite reloads instead of mixing React
      // module instances from different dependency-optimisation generations.
      ignoreOutdatedRequests: false,
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
