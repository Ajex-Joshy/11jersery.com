import { Annotation } from "@langchain/langgraph";

export const GraphAnnotation = Annotation.Root({
  messages: Annotation({
    reducer: (curr, update) => curr.concat(update),
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
