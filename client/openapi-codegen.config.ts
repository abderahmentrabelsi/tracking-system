import {
  generateSchemaTypes,
  generateReactQueryComponents,
} from "@openapi-codegen/typescript";
import { defineConfig } from "@openapi-codegen/cli";
export default defineConfig({
  qore: {
    from: {
      source: "url",
      url: "http://localhost:8383/swagger/doc.json",
    },
    outputDir: "src/qore-api",
    to: async (context) => {
      const filenamePrefix = "qore";
      const { schemasFiles } = await generateSchemaTypes(context, {
        filenamePrefix,
      });
      await generateReactQueryComponents(context, {
        filenamePrefix,
        schemasFiles,
      });
    },
  },
});
