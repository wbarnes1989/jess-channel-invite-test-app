const { App } = require('@slack/bolt');
require('dotenv').config();

// Initializes your app with your bot token and signing secret
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});

// command listener that listens for the /create command and then displays a modal
app.command('/create', async ({ command, ack, client }) => {
    // Acknowledge command request
    await ack();

    try {
        // Call views.open with the built-in client
        const result = await client.views.open({
            trigger_id: command.trigger_id,
            // View payload
            view: {
                "type": "modal",
                "callback_id": "create_channel_view_1",
                "title": {
                    "type": "plain_text",
                    "text": "Create a Channel"
                },
                "close": {
                    "type": "plain_text",
                    "text": "Cancel"
                },
                "blocks": [
                    {
                        "type": "input",
                        "block_id": "channel_input",
                        "element": {
                            "type": "plain_text_input",
                            "action_id": "channel_name"
                        },
                        "label": {
                            "type": "plain_text",
                            "text": "Channel Name"
                        }
                    },
                    {
                        "type": "input",
                        "block_id": "owner_user_select",
                        "element": {
                            "type": "users_select",
                            "action_id": "owner_name"
                        },
                        "label": {
                            "type": "plain_text",
                            "text": "Owner"
                        }
                    },
                    {
                        "type": "input",
                        "block_id": "default_user_select",
                        "element": {
                            "type": "users_select",
                            "action_id": "invite_default_user_select"
                        },
                        "label": {
                            "type": "plain_text",
                            "text": "Select a default user to invite"
                        }
                    }
                ],
                "submit": {
                    "type": "plain_text",
                    "text": "Submit"
                }
            }
        });
    } catch (error) {
        console.error(error);
    }
});

// view listener that listens for the view_submission event and then creates a channel
app.view('create_channel_view_1', async ({ ack, view, client }) => {
    // Acknowledge the view_submission event
    await ack();

    try {
        // Call the conversations.create method using the built-in WebClient
        const result = await client.conversations.create({
            name: view.state.values.channel_input.channel_name.value
        });

        // Call the chat.postMessage method using the WebClient
        const result2 = await client.chat.postMessage({
            token: process.env.SLACK_BOT_TOKEN,
            channel: result.channel.id,
            text: `This channel is owned by <@${view.state.values.owner_user_select.owner_name.selected_user}>`
        });

        // Invite the user selected in modal to the channel
        // Call the conversations.invite method using the built-in WebClient
        const result3 = await client.conversations.invite({
            channel: result.channel.id,
            users: view.state.values.default_user_select.invite_default_user_select.selected_user
        });
    } catch (error) {
        console.error(error);
    } 
});

// event listener that listens for member_joined_channel events
app.event('member_joined_channel', async ({ event, client }) => {
    try {
        // Call the chat.postMessage method using the built-in WebClient
        const result = await client.chat.postMessage({
            channel: event.channel,
            text: `Welcome to the channel, <@${event.user}>! :tada:`
        });
    }
    catch (error) {
        console.error(error);
    }
});

(async () => {
    // Start your app
    await app.start(process.env.PORT || 3000);
  
    console.log('⚡️ Bolt app is running!');
})();