import { OpenAPIHono } from "@hono/zod-openapi";

import createConversation from "./create-conversation";
import deleteConversation from "./delete-conversation";
import getConversationDetail from "./get-conversation-detail";
import getConversations from "./get-conversations";
import getMessages from "./get-messages";
import streamMessage from "./stream-message";

const aiChatApp = new OpenAPIHono();

aiChatApp.route("/", getConversations);
aiChatApp.route("/", getConversationDetail);
aiChatApp.route("/", getMessages);
aiChatApp.route("/", createConversation);
aiChatApp.route("/", deleteConversation);
aiChatApp.route("/", streamMessage);

export default aiChatApp;
