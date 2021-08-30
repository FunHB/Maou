# maou-bot

### Getting Starded

#### Bot Configuration
Create a `config.json` file in the root directory and enter the following information into it:
```json
{
    "token": "<YOUR TOKEN>", // Discord Bot token
    "prefix": "!", // prefix used before bot commands
    "channels": {
        "commands": "<channel id>", // channel for most of bot commands for users
        "reports": "<channel id>", // channel for reported messages
        "modLogs": "<channel id>", // channel for notification about penalties
        "arts": "<channel id>", // channel for "art" command
        "messageDeleteLogs": "<channel id>", // channel for logs of deleted messages
        "upload": "<channel id>", // channel for upload module
        "recrutation": "<channel id>" // category for new created recrutation users channels
    },
    "roles": {
        "mod": "<role id>", // roles for moderators
        "mute": "<role id>", // roles for muted users
        "recrutation": "<role id>" // roles for recruters
    },
    "upload": {
        "dood": "<DOOD api key>", // key to dood api
        "streamsb": "StreamSB api key" // key to streamsb api
    },
    "exp": {
        "minCharInMsg": 1, // minimal amount of characters in message to calculate exp from it
        "maxCharInMsg": 2000, // maximal amount of characters in message to calculate exp from it
        "minExpFromMsg": 1, // minimal amount of exp given to user
        "maxExpFromMsg": 100, // maximal amount of exp given to user
        "expMultiplier": 0.05 // exp per char multiplier
    },
    "messages": {
        "welcome": "<message>", // welcome message. Use "{user}" for guild member mention
        "farewell": "<message>", // farewell message. Use "{user}" for guild member mention
        "recrutation": "<message>" // recrutation message. Use "{user}" for guild member mention
    }
}
```

#### Instalation
1. ##### Instalation required modules
    `npm install`
    
2. ##### Building Bot modules
    `npm run build`
    
3. ##### Starting the Bot
    `npm start`
