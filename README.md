# Automating Expert Routing with Webex bot

### Features

1. User can create engagement request using the bot
2. Bot creates a space with the engagement details, adds experts to the space and also adds the data to the smart sheet
3. On mentioning the bot and sending assign message in the engagement space, bot adds the person to the space and makes them moderator and also bot creates JIRA issue and assigns the person, creates description and start date.
4. On mentioning the bot and sending kill message in the engagement space, bot removes everyone from the space and archives the space
5. https://engagement-bot.wbx.ninja/healthcheck API to check the health of the engagement bot.
6. Allows Administrators to configure bot settings, customizing engagement types, responders, and moderator roles by sending a configure message to the bot. For detailed explanation please view this miro board https://miro.com/app/board/uXjVMLZsD7o=/?share_link_id=158742698470.
7. On mentioning the bot and sending reassign message, the bot removes that space from the team and adds it to the team selected.
8. On mentioning the bot and sending remind message, the bot sends an adaptive card in which we can enter the topic of reminder, date of reminder and select a person to remind (or All in the space).
9. On mentioning the bot and sending close message, the bot closes the space (Adds closed tag to the title)

### Setup

You will need to create a file called **.env** that includes the following lines:

```
PORT=
WEBEX_LOG_LEVEL=debug
WEBEX_ACCESS_TOKEN=
MONGO_URI="mongodb+srv://user:pwd@cluster.mongodb.net"
MONGO_DB=dbName
```

Note:

1. You will need to provide a port for this to run locally
2. You will need to provide an access_token of a test bot for testing
3. Please add the Mongo credentials as shown above in the .env file

### Install

The typical npm install flow, after cloning this repo

```
npm install
npm start
```
