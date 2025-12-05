import fs from "fs";
import path from "path";
import logger from "../../config/logger.js";
import { getProducts } from "./data/products.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import vectorStore from "../config/vectorStore.js";

const ingestData = async () => {
  logger.info("Data ingestion started...");
  const policy = fs.readFileSync(
    path.join(process.cwd(), "ai/data/policy.txt"),
    "utf-8"
  );

  const faqJson = fs.readFileSync(
    path.join(process.cwd(), "ai/data/faq.json"),
    "utf-8"
  );

  const faqData = JSON.parse(faqJson);

  const faqString = faqData
    .map((item) => `Q: ${item.question}\nA: ${item.answer}`)
    .join("\n\n");

  const productsString = await getProducts();

  const fullText = `
=== POLICY DOCUMENT ===
${policy}

=== FAQ ===
${faqString}

=== PRODUCTS ===
${productsString}
`;
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 50,
  });

  const documents = await splitter.createDocuments([fullText]);

  logger.info(`Generated documents of ${documents.length} length`);

  await vectorStore.addDocuments(documents);
  logger.info("All documents uploaded to Pinecone vector store!");

  process.exit(0);
};

ingestData().catch((err) => console.log(err));
