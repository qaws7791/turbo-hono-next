import { OpenAPIHono } from "@hono/zod-openapi";

import getConversations from "./get-conversations";
import getMessages from "./get-messages";
import createConversation from "./create-conversation";
import deleteConversation from "./delete-conversation";
import streamMessage from "./stream-message";

const aiChatApp = new OpenAPIHono();

aiChatApp.route("/", getConversations);
aiChatApp.route("/", getMessages);
aiChatApp.route("/", createConversation);
aiChatApp.route("/", deleteConversation);
aiChatApp.route("/", streamMessage);

export default aiChatApp;
