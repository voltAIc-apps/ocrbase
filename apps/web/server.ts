import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// Import the built TanStack Start server
// @ts-expect-error - built output has no types
import tanstackServer from "./dist/server/server.js";

const port = Number(process.env.PORT) || 3001;
const clientDir = join(import.meta.dir, "dist/client");

const mimeTypes: Record<string, string> = {
  ".css": "text/css",
  ".html": "text/html",
  ".ico": "image/x-icon",
  ".js": "application/javascript",
  ".json": "application/json",
  ".map": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const getMimeType = (path: string): string => {
  const ext = path.slice(path.lastIndexOf("."));
  return mimeTypes[ext] || "application/octet-stream";
};

const tryServeStatic = (pathname: string): Response | null => {
  try {
    const filePath = join(clientDir, pathname);
    const stat = statSync(filePath);
    if (stat.isFile()) {
      const content = readFileSync(filePath);
      return new Response(content, {
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
          "Content-Type": getMimeType(pathname),
        },
      });
    }
  } catch {
    // File not found
  }
  return null;
};

Bun.serve({
  fetch(request) {
    const url = new URL(request.url);

    // Serve static assets from dist/client
    if (
      url.pathname.startsWith("/assets/") ||
      url.pathname.startsWith("/_build/")
    ) {
      const staticResponse = tryServeStatic(url.pathname);
      if (staticResponse) {
        return staticResponse;
      }
    }

    // Handle SSR requests via TanStack Start
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return tanstackServer.fetch(request) as Response | Promise<Response>;
  },
  port,
});

console.log(`Server running at http://localhost:${port}`);
