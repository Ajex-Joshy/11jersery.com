import fs from "fs";
import path from "path";
import logger from "../../config/logger.js";
import { getProducts } from "./data/products.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import vectorStore from "../config/vectorStore.js";
import { Document } from "@langchain/core/documents";

const processPolicies = async () => {
  logger.info("Processing Policies...");
  const policyText = fs.readFileSync(
    path.join(process.cwd(), "ai/data/data/policy.txt"),
    "utf-8"
  );

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 100,
  });

  const docs = await splitter.createDocuments(
    [policyText],
    [{ type: "policy", source: "policy.txt" }]
  );

  return docs;
};

const processFAQs = () => {
  logger.info("Processing FAQs...");
  const faqJson = fs.readFileSync(
    path.join(process.cwd(), "ai/data/data/faq.json"),
    "utf-8"
  );
  const faqData = JSON.parse(faqJson);

  return faqData.map((item) => {
    return new Document({
      pageContent: `Q: ${item.question}\nA: ${item.answer}`,
      metadata: {
        type: "faq",
        category: item.category || "general",
      },
    });
  });
};

const processProducts = async () => {
  logger.info("👕 Processing Products...");
  const products = await getProducts();

  return products.map((product) => {
    const pageContent = `
      Product: ${product.title}
      Description: ${product.description}
      tagline: ${product.shortDescription}
      Keywords: ${product.tags.join(", ")}
    `.trim();

    return new Document({
      pageContent,
      metadata: {
        type: "product",
        productId: product.id.toString(),
        title: product.title,
      },
    });
  });
};

const ingestAll = async () => {
  try {
    logger.info("Starting Master Ingestion...");

    const policyDocs = await processPolicies();
    const faqDocs = processFAQs();
    const productDocs = await processProducts();

    const allDocs = [...policyDocs, ...faqDocs, ...productDocs];

    logger.info(` Total Documents generated: ${allDocs.length}`);
    logger.info(`   - Policies: ${policyDocs.length}`);
    logger.info(`   - FAQs: ${faqDocs.length}`);
    logger.info(`   - Products: ${productDocs.length}`);

    logger.info("Uploading to Vector DB...");

    const BATCH_SIZE = 200;
    for (let i = 0; i < allDocs.length; i += BATCH_SIZE) {
      const batch = allDocs.slice(i, i + BATCH_SIZE);
      logger.info(
        `Uploading batch ${i / BATCH_SIZE + 1} (${batch.length} docs)`
      );
      await vectorStore.addDocuments(batch);
    }

    logger.info(" Ingestion Complete!");
    process.exit(0);
  } catch (error) {
    logger.error(" Ingestion Failed:", error);
    process.exit(1);
  }
};

ingestAll();
