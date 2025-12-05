import { classifyIntent } from "./nodes/supervisorNode.js";

const result1 = await classifyIntent("What is your refund policy?");
console.log(result1);

const result2 = await classifyIntent("Track my order ODR99438");
console.log(result2);

const result3 = await classifyIntent("Suggest blue medium jersey");
console.log(result3);
