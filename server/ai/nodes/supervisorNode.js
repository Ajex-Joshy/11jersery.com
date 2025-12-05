import { SystemMessage } from "@langchain/core/messages";
import logger from "../../config/logger.js";
import { llm } from "../config/model.js";
import z from "zod";

const routeSchema = z.object({
  step: z.enum(["product_agent", "order_agent", "support_agent", "FINISH"]),
  reasoning: z
    .string()
    .describe("Brief reason for selecting this agent, for debugging logs."),
});

const supervisorRouter = llm.withStructuredOutput(routeSchema, {
  name: "route_user_intent",
});

const SYSTEM_PROMPT = `You are the Supervisor (Router) for an e-commerce AI assistant.
Your sole job is to analyze the user's latest message and route it to the correct specialist worker.

### WORKER DEFINITIONS:
- **product_agent**: Handles generic product questions, return policies, shipping policies, and "shopping" queries.
- **order_agent**: Handles specific transaction questions (e.g., "Where is my order?", "Cancel order). Requires user context.
- **support_agent**: Handles complaints, angry users, broken items, or requests to speak to a human.

### RULES:
- If the user says "Goodbye" or the conversation is clearly over, route to "FINISH".
- If the intent is ambiguous (e.g., "Help"), default to "product_agent" to offer general assistance.
- Do not attempt to answer the question yourself. Only route.
`;

export const supervisorNode = async (state) => {
  const messages = state.messages;

  if (!messages || messages.length === 0) {
    logger.warn(
      "Supervisor received empty message history. Defaulting to FINISH."
    );
    return { next: "FINISH" };
  }

  const response = await supervisorRouter.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    ...messages,
  ]);

  console.log(
    `supervisor routing to ${response.step} | Reason: ${response.reasoning}`
  );
  return { next: response.step };
};
