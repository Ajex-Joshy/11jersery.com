import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
import { GraphAnnotation } from "./state.js";
import { supervisorNode } from "../nodes/supervisorNode.js";
import { generalAgentNode } from "../nodes/generalAgentNode.js";
import { productAgentNode } from "../nodes/productAgentNode.js";
import { supportAgentNode } from "../nodes/supportAgentNode.js";
// import redisClient from "../../config/redis-client.js";
import { RedisSaver } from "@langchain/langgraph-checkpoint-redis";
import { getCheckpointer } from "../config/checkpointer.js";

// const checkpointer = new RedisSaver({ client: redisClient }); // for production

// const checkpointer = new MemorySaver();

const workflow = new StateGraph(GraphAnnotation)
  .addNode("supervisor", supervisorNode)
  .addNode("general_agent", generalAgentNode)
  .addNode("product_agent", productAgentNode)
  .addNode("support_agent", supportAgentNode)
  .addEdge(START, "supervisor")
  .addConditionalEdges("supervisor", (state) => state.next, {
    general_agent: "general_agent",
    product_agent: "product_agent",
    support_agent: "support_agent",
    FINISH: END,
  })
  .addEdge("general_agent", END)
  .addEdge("product_agent", END)
  .addEdge("support_agent", END);

let compiledGraph = null;

export const getGraph = async () => {
  if (compiledGraph) return compiledGraph;

  const checkpointer = await getCheckpointer();
  console.log("Using checkpointer:", checkpointer);
  compiledGraph = workflow.compile(checkpointer);
  return compiledGraph;
};
