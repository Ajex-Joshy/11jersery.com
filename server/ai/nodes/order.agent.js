import { ToolMessage, SystemMessage } from "@langchain/core/messages";
import { llm } from "../config/model.js";
import { orderLookupTool } from "../tools/orderLoopupTool.js";

const SYSTEM_PROMPT = `You are an Order Support Assistant.
- If the user asks about a specific order (e.g., "Where is order #123?"), use the tool with that ID.
- If the user asks about "my orders" or "recent purchases", call the tool without an ID.
- Return a summary in text, but ensure the full JSON is passed to the client.`;

export const orderAgent = async (state) => {
  const { messages } = state;
  const llmWithTools = llm.bindTools(orderLookupTool);

  const aiMessage = await llmWithTools.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    ...messages,
  ]);
  if (!aiMessage.tool_calls || aiMessage.tool_calls.length === 0) {
    return { messages: [aiMessage] };
  }

  const toolResults = await Promise.all(
    aiMessage.tool_calls.map(async (toolCall) => {
      try {
        // Pass the 'config' down so the tool can access 'userId'
        const rawOutput = await orderHistoryTool.invoke(toolCall, config);

        return {
          message: new ToolMessage({
            tool_call_id: toolCall.id,
            content: rawOutput,
            name: toolCall.name,
          }),
          data: JSON.parse(rawOutput),
        };
      } catch (error) {
        logger.error("Order tool error:", error);
        return {
          message: new ToolMessage({
            tool_call_id: toolCall.id,
            content: `Error fetching orders: ${error.message}`,
            name: toolCall.name,
            status: "error",
          }),
          data: [],
        };
      }
    })
  );

  const toolMessages = toolResults.map((res) => res.message);

  const allOrders = toolResults.flatMap((res) => res.data);

  const finalResponse = await llmWithTools.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    ...messages,
    aiMessage,
    ...toolMessages,
  ]);

  if (allOrders.length > 0) {
    finalResponse.response_metadata = {
      ...finalResponse.response_metadata,
      client_payload: {
        responseType: "order_list",
        orders: allOrders,
      },
    };
  }

  return { messages: [aiMessage, ...toolMessages, finalResponse] };
};
