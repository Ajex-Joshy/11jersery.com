import { tool } from "@langchain/core/tools";
import z from "zod";
import vectorStore from "../config/vector-store.js";

export const policySearchTool = tool(
  async ({ query }) => {
    const results = await vectorStore.similaritySearch(query, 4, {
      type: "policy",
    });

    if (!results.length)
      return "I couldn't find specific policy details on that.";

    return results.map((r) => r.pageContent).join("\n\n");
  },
  {
    name: "lookup_support_info",
    description:
      "Retrieve return policies, shipping info, FAQs, and terms of service.",
    schema: z.object({
      query: z
        .string()
        .describe(
          "The specific question (e.g. 'return period', 'how to wash')"
        ),
    }),
  }
);
