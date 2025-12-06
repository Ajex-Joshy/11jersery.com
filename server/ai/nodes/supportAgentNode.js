import { SystemMessage, ToolMessage } from "@langchain/core/messages";
import { llm } from "../config/model.js";
import { policySearchTool } from "../tools/policySearchTool.js";

const SUPPORT_PROMPT = `You are the Customer Support Specialist.
- Use the 'lookup_policy_info' tool to check return windows, shipping info, or terms.
- Be polite, empathetic, and professional.
- If the policy isn't clear, ask the user for clarification.`;

export const supportAgentNode = async (state) => {
  const { messages } = state;
  const llmWithTools = llm.bindTools([policySearchTool]);
  const response = await llmWithTools.invoke([
    new SystemMessage(SUPPORT_PROMPT),
    ...messages,
  ]);

  if (response.tool_calls && response.tool_calls.length > 0) {
    const toolCall = response.tool_calls[0];

    const toolOutput = await policySearchTool.invoke(toolCall);

    const finalResponse = await llmWithTools.invoke([
      new SystemMessage(SUPPORT_PROMPT),
      ...messages,
      response,
      new ToolMessage({
        tool_call_id: toolCall.id,
        content: toolOutput,
        name: toolCall.name,
      }),
    ]);
    return { messages: [finalResponse] };
  }
  return { messages: [response] };
};
