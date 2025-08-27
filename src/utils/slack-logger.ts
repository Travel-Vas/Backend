import {WebClient} from "@slack/web-api";
import {CustomError} from "../helpers/lib/App";
import {StatusCodes} from "http-status-codes";
// import {category, SupportInterface} from "../resources/admin/support/support.interface";
let category:any
const SLACK_BOT_TOKEN = process.env.SLACK_TOKEN;
const SLACK_CHANNEL_ID = process.env.SLACK_CHANNEL_ID;
const SLACK_SUPPORT_CHANNEL_ID = process.env.SLACK_SUPPORT_CHANNEL_ID;


export const slackLogger = async (message: any) => {
    try {
        if (!SLACK_BOT_TOKEN) {
            throw new CustomError({
                message: 'Slack Token is not provided',
                code: StatusCodes.BAD_REQUEST,
            });
        }
        if (!SLACK_CHANNEL_ID || !SLACK_SUPPORT_CHANNEL_ID) {
            throw new CustomError({
                message: 'Slack Channel ID is not provided',
                code: StatusCodes.BAD_REQUEST,
            });
        }
        const slackClient = new WebClient(SLACK_BOT_TOKEN);
        // Verify bot is in the channel first
        try {
            const bugChannelInfo = await slackClient.conversations.info({
                channel: SLACK_CHANNEL_ID
            });
            const supportChannelInfo = await slackClient.conversations.info({
                channel: SLACK_SUPPORT_CHANNEL_ID
            });
            if (!bugChannelInfo.ok || !supportChannelInfo) {
                throw new Error('Unable to access channel');
            }
        } catch (channelVerifyError: any) {
            throw new CustomError({
                message: `Channel verification failed: ${channelVerifyError.message}`,
                code: StatusCodes.FORBIDDEN,
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
        if(message.category === category.Technical){
            const result = await slackClient.chat.postMessage({
                ...slackMessage1,
                channel: SLACK_CHANNEL_ID,
            });
            return result;
        }
        const result = await slackClient.chat.postMessage({
             ...slackMessage2,
            channel: SLACK_SUPPORT_CHANNEL_ID,
        });

        return result;
    } catch (error: any) {
        console.error('Slack Logger Error:', error);

        // More granular error handling
        if (error.code === 'missing_scope') {
            throw new CustomError({
                message: 'Slack Bot lacks necessary permissions. Check bot scopes.',
                code: StatusCodes.FORBIDDEN,
            });
        }

        throw new CustomError({
            message: error.message || 'Slack logging failed',
            code: error.code || StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
}