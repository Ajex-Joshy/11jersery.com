import { StateGraph, START, END } from "@langchain/langgraph";
import { GraphAnnotation } from "./state.js";
import { supervisorNode } from "../nodes/supervisor.agent.js";
import { generalAgentNode } from "../nodes/ general.agent.js";
import { productAgentNode } from "../nodes/product.agent.js";
import { supportAgentNode } from "../nodes/support.agent.js";
import { getCheckpointer } from "../config/checkpointer.js";

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
  compiledGraph = workflow.compile(checkpointer);
  return compiledGraph;
};
