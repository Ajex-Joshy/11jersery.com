import { SystemMessage } from "@langchain/core/messages";
import logger from "../../config/logger.js";
import { llm } from "../config/model.js";
import z from "zod";
import { tool } from "@langchain/core/tools";

const routeSchema = z.object({
  step: z.enum([
    "product_agent",
    "order_agent",
    "support_agent",
    "general_agent",
    "FINISH",
  ]),
  reasoning: z
    .string()
    .describe("Brief reason for selecting this agent, for debugging logs."),
});

const routeTool = tool(async () => "Routing...", {
  name: "route_request",
  description: "Route the user's request to the appropriate worker agent.",
  schema: routeSchema,
});

const SYSTEM_PROMPT = `You are the Supervisor (Router) for an e-commerce AI assistant.
Your sole job is to analyze the user's latest message and route it to the correct specialist worker.

### WORKER DEFINITIONS:
- **product_agent**: STRICTLY for searching products, checking stock, and finding jersey prices.
- **order_agent**: Specific order tracking, cancellations, refunds.
- **support_agent**: Handles return policies, shipping policies, complaints, and "How to" questions.
- **general_agent**: Greetings ("hi"), small talk, or off-topic queries.

### RULES:
- If "Goodbye", route to FINISH.
- If ambiguous or purely a greeting, route to general_agent.
`;

export const supervisorNode = async (state) => {
  try {
    const messages = state.messages;

    if (!messages || messages.length === 0) {
      logger.warn(
        "Supervisor received empty message history. Defaulting to FINISH."
      );
      return { next: "FINISH" };
    }

    const supervisorRouter = llm.bindTools([routeTool], {
      tool_choice: "route_request",
    });

    const response = await supervisorRouter.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      ...messages,
    ]);

    const toolCall = response.tool_calls?.[0];

    if (!toolCall) {
      logger.warn(
        "Supervisor failed to generate a tool call. Defaulting to general_agent."
      );
      return { next: "general_agent" };
    }

    const { step, reasoning } = toolCall.args;

    logger.info(`supervisor routing to ${step} | Reason: ${reasoning}`);
    return { next: step };
  } catch (error) {
    logger.error(`Supervisor Node Error: ${error.message}`);

    return {
      messages: [
        new AIMessage(
          "I'm having a little trouble connecting right now. Could you ask me about our products again?"
        ),
      ],
    };
  }
};
