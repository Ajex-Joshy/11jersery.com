import { SystemMessage, ToolMessage } from "@langchain/core/messages";
import { llm } from "../config/model.js";
import { productSearchTool } from "../tools/productSearchTool.js";

const SYSTEM_PROMPT = `You are a Product Recommendation and Support Assistant for 11Jersey.
- Use the 'productSearchTool' to search products by title, team, league, or player.
- Always ask a clarification question if the user's intent is unclear.
- Provide concise, helpful answers and avoid long paragraphs.
- When returning product results, summarize key details such as price, discount, and stock status.
- Maintain a polite and friendly tone.`;

export const productAgentNode = async (state) => {
  const { messages } = state;
  const llmWithTools = llm.bindTools([productSearchTool]);

  const response = await llmWithTools.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    ...messages,
  ]);

  if (response.tool_calls && response.tool_calls.length > 0) {
    const toolCall = response.tool_calls[0];

    const rawToolOutput = await productSearchTool.invoke(toolCall);

    let outputString = "";
    let productsArray = [];

    try {
      if (typeof rawToolOutput === "object") {
        outputString = JSON.stringify(rawToolOutput);
        productsArray = rawToolOutput;
      } else {
        outputString = rawToolOutput;
        productsArray = JSON.parse(rawToolOutput);
      }
    } catch (error) {
      console.error("Error parsing tool output:", error);
      outputString = String(rawToolOutput);
    }
    const toolMessage = new ToolMessage({
      tool_call_id: toolCall.id,
      content: outputString,
      name: toolCall.name,
    });

    const llmFinal = await llmWithTools.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      ...messages,
      response, // The initial thought containing the tool_call
      toolMessage, // The actual result from the database
    ]);

    llmFinal.response_metadata = {
      ...llmFinal.response_metadata,
      client_payload: {
        responseType: "product_list",
        products: productsArray,
      },
    };

    return { messages: [response, toolMessage, llmFinal] };
  }

  return { messages: [response] };
};
