# maou-bot

### Getting Starded

#### Bot Configuration
Create a `config.json` file in the root directory and enter the following information into it:
```json
{
    "token": "<YOUR TOKEN>", // Discord Bot token
    "databaseString": "<Postgresql database connection string>", // connection string
    "prefix": "!", // prefix used before bot commands
    "upload": {
        "dood": "<DOOD api key>", // key to dood api
        "streamsb": "<StreamSB api key>" // key to streamsb api
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
Install and start bot just by running file "run.sh".
