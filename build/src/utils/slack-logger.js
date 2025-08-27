"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.slackLogger = void 0;
const web_api_1 = require("@slack/web-api");
const App_1 = require("../helpers/lib/App");
const http_status_codes_1 = require("http-status-codes");
// import {category, SupportInterface} from "../resources/admin/support/support.interface";
let category;
const SLACK_BOT_TOKEN = process.env.SLACK_TOKEN;
const SLACK_CHANNEL_ID = process.env.SLACK_CHANNEL_ID;
const SLACK_SUPPORT_CHANNEL_ID = process.env.SLACK_SUPPORT_CHANNEL_ID;
const slackLogger = (message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!SLACK_BOT_TOKEN) {
            throw new App_1.CustomError({
                message: 'Slack Token is not provided',
                code: http_status_codes_1.StatusCodes.BAD_REQUEST,
            });
        }
        if (!SLACK_CHANNEL_ID || !SLACK_SUPPORT_CHANNEL_ID) {
            throw new App_1.CustomError({
                message: 'Slack Channel ID is not provided',
                code: http_status_codes_1.StatusCodes.BAD_REQUEST,
            });
        }
        const slackClient = new web_api_1.WebClient(SLACK_BOT_TOKEN);
        // Verify bot is in the channel first
        try {
            const bugChannelInfo = yield slackClient.conversations.info({
                channel: SLACK_CHANNEL_ID
            });
            const supportChannelInfo = yield slackClient.conversations.info({
                channel: SLACK_SUPPORT_CHANNEL_ID
            });
            if (!bugChannelInfo.ok || !supportChannelInfo) {
                throw new Error('Unable to access channel');
            }
        }
        catch (channelVerifyError) {
            throw new App_1.CustomError({
                message: `Channel verification failed: ${channelVerifyError.message}`,
                code: http_status_codes_1.StatusCodes.FORBIDDEN,
            });
        }
        const slackMessage1 = {
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: "*New Bug Request* :warning:"
                    }
                },
                {
                    type: "divider"
                },
                {
                    type: "section",
                    fields: [
                        {
                            type: "mrkdwn",
                            text: "*Name:*\n" + message.name
                        },
                        {
                            type: "mrkdwn",
                            text: "*Email:*\n" + message.email
                        }
                    ]
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: "*Message:*\n" + message.message
                    }
                },
                {
                    type: "context",
                    elements: [
                        {
                            type: "mrkdwn",
                            text: "_Received via Support Channel_"
                        }
                    ]
                }
            ]
        };
        const slackMessage2 = {
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: "*New Support Request* :warning:"
                    }
                },
                {
                    type: "divider"
                },
                {
                    type: "section",
                    fields: [
                        {
                            type: "mrkdwn",
                            text: "*Name:*\n" + message.name
                        },
                        {
                            type: "mrkdwn",
                            text: "*Email:*\n" + message.email
                        }
                    ]
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: "*Message:*\n" + message.message
                    }
                },
                {
                    type: "context",
                    elements: [
                        {
                            type: "mrkdwn",
                            text: "_Received via Support Channel_"
                        }
                    ]
                }
            ]
        };
        // Post message
        if (message.category === category.Technical) {
            const result = yield slackClient.chat.postMessage(Object.assign(Object.assign({}, slackMessage1), { channel: SLACK_CHANNEL_ID }));
            return result;
        }
        const result = yield slackClient.chat.postMessage(Object.assign(Object.assign({}, slackMessage2), { channel: SLACK_SUPPORT_CHANNEL_ID }));
        return result;
    }
    catch (error) {
        console.error('Slack Logger Error:', error);
        // More granular error handling
        if (error.code === 'missing_scope') {
            throw new App_1.CustomError({
                message: 'Slack Bot lacks necessary permissions. Check bot scopes.',
                code: http_status_codes_1.StatusCodes.FORBIDDEN,
            });
        }
        throw new App_1.CustomError({
            message: error.message || 'Slack logging failed',
            code: error.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
});
exports.slackLogger = slackLogger;
