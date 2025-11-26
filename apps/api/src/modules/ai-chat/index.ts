import { OpenAPIHono } from "@hono/zod-openapi";

import createConversation from "./routes/create-conversation";
import deleteConversation from "./routes/delete-conversation";
import getConversationDetail from "./routes/get-conversation-detail";
import getConversations from "./routes/get-conversations";
import getMessages from "./routes/get-messages";
import streamMessage from "./routes/stream-message";

const aiChatApp = new OpenAPIHono();

aiChatApp.route("/", getConversations);
aiChatApp.route("/", getMessages);
aiChatApp.route("/", getConversationDetail);
aiChatApp.route("/", createConversation);
aiChatApp.route("/", deleteConversation);
aiChatApp.route("/", streamMessage);

export default aiChatApp;
