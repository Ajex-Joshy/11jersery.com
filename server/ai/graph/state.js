import { Annotation } from "@langchain/langgraph";

const MAX_MESSAGES = 12;

const slidingWindowReducer = (current, update) => {
  const newMessages = Array.isArray(update) ? update : [update];
  const allMessages = [...current, ...newMessages];

  if (allMessages.length > MAX_MESSAGES) {
    return allMessages.slice(-MAX_MESSAGES);
  }

  return allMessages;
};

export const GraphAnnotation = Annotation.Root({
  messages: Annotation({
    reducer: slidingWindowReducer,
    default: () => [],
  }),
  userId: Annotation({
    reducer: (curr, update) => update ?? curr,
    default: () => "guest",
  }),
  next: Annotation({
    reducer: (curr, update) => update ?? curr,
    default: () => "supervisor",
  }),
  sentiment: Annotation({
    reducer: (curr, update) => update ?? curr,
    default: () => "neutral",
  }),
});
