import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// The same "@/" import alias as tsconfig.json, so component tests can render real components.
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
});
