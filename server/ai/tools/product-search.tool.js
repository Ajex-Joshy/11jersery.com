import { tool } from "@langchain/core/tools";
import logger from "../../config/logger.js";
import vectorStore from "../config/vector-store.js";
import z from "zod";
import Product from "../../models/product.model.js";

export const productSearchTool = tool(
  async ({ query }) => {
    logger.info(
      `[Product Tool] 1. Searching Vector DB for semantic match: "${query}"`
    );
    try {
      const semanticResults = await vectorStore.similaritySearch(query, 5);

      if (!semanticResults.length) {
        return "No products found matching that description.";
      }

      const productIds = semanticResults.map((doc) => doc.metadata.productId);

      const productDetails = await Product.find({
        _id: { $in: productIds },
        isDeleted: false,
        isListed: true,
      })
        .select("_id title slug imageIds price rating shortDescription")
        .lean();

      return productDetails;
    } catch (err) {
      logger.error(`Error finding products: ${err}`);
    }
  },
  {
    name: "product_search",
    description: "Search vector DB for products ",
    schema: z.object({
      query: z.string().describe("User search text"),
    }),
  }
);
