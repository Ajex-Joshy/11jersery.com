import { getProducts } from "./data/products.js";
import vectorStore from "../config/vectorStore.js";
import logger from "../../config/logger.js";
import { Document } from "@langchain/core/documents";

const ingestProduct = async () => {
  logger.info(" Starting Product Catalog Synchronization...");

  try {
    const products = await getProducts();

    if (!products.length) {
      logger.warn(
        " No products found in MongoDB. Skipping sync to prevent accidental wipe."
      );
      process.exit(0);
    }

    logger.info(`📦 Fetched ${products.length} active products from MongoDB.`);

    logger.info("Purging old product vectors...");

    try {
      await vectorStore.delete({ filter: { type: "product" } });
    } catch (e) {
      logger.warn(
        " Delete by filter failed (provider might not support it). Proceeding with Upsert.Stopping process..."
      );
      process.exit(0);
    }

    const documents = products.map((product) => {
      const pageContent = `
        Product Name: ${product.title}
        Description: ${product.description}
        Tagline: ${product.tagline}
        Keywords: ${product.tags.join(", ")}
      `.trim();

      return new Document({
        pageContent: pageContent,
        id: product.id.toString(),
        metadata: {
          productId: product.id.toString(),
          title: product.title,
          type: "product",
        },
      });
    });

    logger.info(`📤 Uploading ${documents.length} fresh vectors...`);
    await vectorStore.addDocuments(documents);

    logger.info(" Synchronization Complete! Vector DB is 1:1 with MongoDB.");
    process.exit(0);
  } catch (err) {
    logger.error(" Ingestion Failed:", err);
    process.exit(1);
  }
};

ingestProduct();
