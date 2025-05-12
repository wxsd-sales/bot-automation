import { config } from 'dotenv';
config();
import Webex from 'webex';
import { formSubmitted } from './form-submit.js';
import { sendMainCard, sendWebexMessage } from './general/messages.js';
import { getRoomDetails } from './general/get-room-details.js';
import { reassignSpace, reassignSubmit } from './reassign/reassign.js';
import { assignSpace, jiraAssign } from './assign/assign-space.js';
import { taskRemind, reminder } from './taskReminder/task-reminder.js';
import * as constants from '../utils/constants.js';
import {
  mongoClient,
  mongoDB,
  typeCol,
  deleteReminder,
  updateEngagementByRoomId,
  getDetailsByEngagementType
} from '../utils/db.js';
import * as configurer from './configurer/index.js';
import mainChangeCard from '../cards/mainChangeCard.json' assert { type: 'json' };
import mainChangeCardWithAdd from '../cards/mainChangeCardWithAdd.json' assert { type: 'json' };
import { getUsers } from './assign/get-jira-values.js';
import aiCard from '../cards/aiCard.json' assert { type: 'json' };

const webex = Webex.init({
  credentials: {
    access_token: process.env.WEBEX_ACCESS_TOKEN
  }
});

var botId;
var botEmail;
function botSetup() {
  webex.people
    .get('me')
    .then(function (person) {
      botId = person.id;
      botEmail = person.emails[0];
      console.log(`Saving BotId:${botId}`);
    })
    .catch(function (reason) {
      console.error(reason);
      process.exit(1);
    });
}

function killSpace(roomId, personEmail) {
  console.log('---- Exit Card ----');
  webex.memberships
    .list({ roomId: roomId })
    .then(async function (memberships) {
      for (var i = 0; i < memberships.length; i += 1) {
        if (memberships.items[i].isModerator === true && memberships.items[i].personEmail === personEmail) {
          webex.rooms.remove(roomId).catch(function (reason) {
            sendWebexMessage(roomId, `Delete rooms failed: ${reason}`);
            console.log('delete rooms failed  - ', reason);
          });
          updateEngagementByRoomId(roomId, 'status');
        } else if (memberships.items[i].isModerator != true && memberships.items[i].personEmail === personEmail) {
          sendWebexMessage(roomId, `Only **moderators** can perform this action`);
        } else {
          continue;
        }
      }
    })
    .catch((e) => {
      sendWebexMessage(roomId, `Error while listing memberships: ${e}`);
      console.log('Error while listing memberships', e);
    });
}

async function inactivityReminder() {
  try {
    const today = new Date();
    const date = new Date(today.setDate(today.getDate() - 3));
    const formattedDate = date.toISOString().split('T')[0];
    console.log(formattedDate);
    let cursor = await mongoClient
      .db(mongoDB)
      .collection('engagement-details')
      .aggregate([{ $match: { date_submitted: formattedDate } }]);
    let doc;
    while (await cursor.hasNext()) {
      doc = await cursor.next();
      getRoomDetails(doc.room_id).then((r) => {
        // console.log('get room data', r);
        var lastAct = r.lastActivity.slice(0, 16);
        var created = r.created.slice(0, 16);
        console.log('get room data', lastAct);
        console.log(created);
        if (lastAct == created) {
          console.log('No action done yet in the group');
          sendWebexMessage(
            doc.room_id,
            `<@all> - **Inactivity Reminder:** This space has been inactive from past 3 days.`
          );
        }
      });
    }
  } catch (e) {
    console.log('Error in inactivity reminder:', e);
  }
}

async function displayReminder() {
  console.log('in display reminder');
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    console.log(formattedDate);
    let cursor = await mongoClient
      .db(mongoDB)
      .collection('task-reminders')
      .aggregate([{ $match: { date: formattedDate } }]);
    let doc;
    while (await cursor.hasNext()) {
      doc = await cursor.next();
      console.log('doc:', doc);
      if (doc.reminderTo == 'all') {
        sendWebexMessage(doc.roomId, `<@all> - **Reminder:** ${doc.title}`);
      } else {
        sendWebexMessage(doc.roomId, `<@personEmail:${doc.reminderTo}> - **Reminder:** ${doc.title}`);
      }
      console.log(doc._id);
      await deleteReminder(doc._id);
    }
  } catch (e) {
    console.log('Error in display reminder:', e);
  }
}

function dbControl(roomId, personEmail) {
  try {
    mongoClient
      .db(mongoDB)
      .collection('access-controllers')
      .find()
      .toArray(async function (err, documents) {
        for (let doc of documents) {
          if (doc.controllers.includes(personEmail)) {
            mongoClient
              .db(mongoDB)
              .collection(typeCol)
              .find()
              .toArray(function (err, documents) {
                console.log('got engagementTypes');
                console.log(documents);
                if (documents && documents.length > 0) {
                  mainChangeCard.body[0].text = constants.TITLE;
                  mainChangeCard.body[1].text = constants.MAIN_CARD_STATEMENT;
                  mainChangeCard.body[2].actions[0].iconUrl = constants.ADD_ICON_URL;
                  mainChangeCard.body[2].actions[1].iconUrl = constants.MODIFY_ICON_URL;
                  mainChangeCard.body[2].actions[2].iconUrl = constants.REMOVE_ICON_URL;
                  sendWebexMessage(roomId, 'Engagement Request Form - Adaptive Card', mainChangeCard);
                } else {
                  mainChangeCard.body[0].text = constants.TITLE;
                  mainChangeCard.body[1].text = constants.MAIN_CARD_STATEMENT;
                  mainChangeCard.body[2].actions[0].iconUrl = constants.ADD_ICON_URL;
                  sendWebexMessage(roomId, 'Engagement Request Form - Adaptive Card', mainChangeCardWithAdd);
                }
              });
          } else {
            sendWebexMessage(roomId, `Only **administrators** can perform this action`);
          }
        }
      });
  } catch (e) {
    console.log('Error in dbControl:', e);
  }
}

function eventListener() {
  console.log('connected');
  webex.messages
    .listen()
    .then(() => {
      console.log('listening to message events');
      webex.messages.on('created', (message) => {
        if (message.actorId != botId) {
          console.log('message created event:');
          console.log(message);
          let roomId = message.data.roomId;
          let personEmail = message.data.personEmail;
          let textMessage = message.data.text;
          let personId = message.data.personId;
          console.log(message.data);
          if (textMessage.toLowerCase().endsWith('kill')) {
            killSpace(roomId, personEmail);
          } else if (textMessage.toLowerCase().endsWith('reassign')) {
            reassignSpace(roomId, personEmail, personId);
          } else if (textMessage.toLowerCase().includes('assign')) {
            assignSpace(roomId, personEmail);
          } else if (textMessage.toLowerCase().includes('configure')) {
            dbControl(roomId, personEmail);
          } else if (textMessage.toLowerCase().includes('remind')) {
            taskRemind(roomId);
          } else {
            sendMainCard(roomId, personEmail);
          }
        }
      });
    })
    .catch((err) => {
      console.error(`error listening to messages: ${err}`);
    });

  webex.attachmentActions
    .listen()
    .then(() => {
      console.log('listening to attachmentAction events');
      webex.attachmentActions.on('created', (attachmentAction) => {
        console.log('------------------------------------------------');
        console.log('attachmentAction created event:');
        console.log(attachmentAction);
        let messageId = attachmentAction.data.messageId;
        let roomId = attachmentAction.data.roomId;
        let inputs = attachmentAction.data.inputs;

        console.log(inputs);
        webex.people.get(attachmentAction.actorId).then(async (person) => {
          let personEmail = person.emails[0];
          let personId = person.id;
          if (inputs.submit == 'main') {
            // var isANumber = isNaN(inputs.tcv_value) === false;
            if (inputs.customer_name != '' && inputs.opportunity_link != '' && inputs.tcv_value != '') {
              formSubmitted(attachmentAction.actorId, inputs, roomId);
              removeMessage(messageId);
            } else {
              sendWebexMessage(
                roomId,
                `Resubmit request - Please provide **customer name**, **opportunity link** and **Total Contract Value** to continue.`
              );
            }
          } else if (inputs.submit == 'assign') {
            // var isANumber = isNaN(inputs.tcv_value) === false;
            if (inputs.name != '') {
              try {
                let cursor = await mongoClient
                  .db(mongoDB)
                  .collection('engagement-details')
                  .aggregate([{ $match: { room_id: roomId } }]);
                let doc;
                if (await cursor.hasNext()) {
                  doc = await cursor.next();
                  jiraAssign(inputs.name, inputs.quater, roomId, doc.comments, doc.opportunity_link);
                }

                removeMessage(messageId);
                sendWebexMessage(
                  roomId,
                  `Thank you for your submission. ${inputs.name} has been assigned the lead on this engagement.`
                );
              } catch (e) {
                console.log('Error in assigning lead:', e);
              }
            } else {
              sendWebexMessage(roomId, `Resubmit request - Please provide **Name** to continue.`);
            }
          } else if (inputs.submit == 'intro') {
            removeMessage(messageId);
            sendMainCard(roomId);
          } else if (inputs.submit == 'reassign') {
            if (inputs.engagement_type != '') {
              removeMessage(messageId);
              reassignSubmit(roomId, inputs, personId);
            } else {
              sendWebexMessage(roomId, 'Please select an engagement type and resubmit to continue.');
            }
          } else if (inputs.submit == 'remind') {
            if (inputs.date != '' && inputs.title != '') {
              reminder(roomId, inputs, personEmail);
              removeMessage(messageId);
            } else {
              sendWebexMessage(roomId, 'Please input title and date and resubmit to continue.');
            }
          } else if (inputs.command == 'delete') {
            removeMessage(messageId);
          } else if (
            inputs.command == 'add_conf' ||
            inputs.command == 'modify_conf' ||
            inputs.command == 'remove_conf'
          ) {
            removeMessage(messageId);
            configurer.changeDB(roomId, messageId, inputs);
          } else if (
            inputs.command == 'modify_members' ||
            inputs.command == 'modify_links' ||
            inputs.command == 'modify_other_details'
          ) {
            configurer.modify(roomId, messageId, inputs);
          } else if (inputs.command == 'modify-step-1' || inputs.command == 'modify-link-step-1') {
            configurer.modifyTeam(roomId, messageId, inputs);
          } else if (inputs.command == 'add_responders') {
            inputs.activity = 'add_members';
            configurer.modifyTeam(roomId, messageId, inputs);
          } else if (inputs.command.includes('change_mod')) {
            configurer.changeModRoute(roomId, messageId, inputs);
          } else if (inputs.command.includes('team_add')) {
            configurer.addTeamRoute(roomId, messageId, inputs);
          } else if (inputs.command.includes('team_remove')) {
            configurer.removeTeamRoute(roomId, messageId, inputs);
          } else if (inputs.command.includes('member_add')) {
            configurer.addNewMemberRoute(roomId, messageId, inputs);
          } else if (inputs.command.includes('links_add')) {
            configurer.addNewLinksRoute(roomId, messageId, inputs);
          } else if (inputs.command.includes('links_remove')) {
            configurer.removeLinksRoute(roomId, messageId, inputs);
          } else if (inputs.command.includes('member_remove')) {
            configurer.removeMembersRoute(roomId, messageId, inputs);
          } else if (inputs.command.includes('modify_title')) {
            configurer.changeTitleRoute(roomId, messageId, inputs);
          } else if (inputs.command.includes('modify_notes')) {
            configurer.modifyNotesRoute(roomId, messageId, inputs);
          }
        });
      });
    })
    .catch((err) => {
      console.error(`error listening to attachmentActions: ${err}`);
    });
}

function removeMessage(messageId) {
  try {
    webex.messages.remove(messageId);
  } catch (e) {
    console.log('Error in removeMessage:', e);
  }
}

export { botSetup, eventListener, removeMessage, displayReminder, inactivityReminder, webex };
