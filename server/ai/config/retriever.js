import vectorStore from "./vectorStore.js";

export const retriever = vectorStore.asRetriever({ k: 4 });
