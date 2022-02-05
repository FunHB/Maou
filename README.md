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
        "expMultiplier": 1 // exp per char multiplier
    }
}
```

#### Instalation
Install dependencies: npm i  
Build project: npm run build  
Start bot: npm start  
Build and Start (on linux only): ./run.sh  
