import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
import { GraphAnnotation } from "./state";
import { supervisorNode } from "../nodes/supervisorNode";
import redisClient from "../../config/redis-client.js";
import { RedisSaver } from "@langchain/langgraph-checkpoint-redis";

// const checkpointer = new RedisSaver({ client: redisClient }); // for production

const checkpointer = new MemorySaver();

const builder = new StateGraph(GraphAnnotation)
  .addNode("supervisor", supervisorNode)
  .addEdge(START, "supervisor");

export const graph = builder.compile({ checkpointer });
