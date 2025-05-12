import { webex } from '../main.js';

import mainCard from '../../cards/main.json' assert { type: 'json' };
import { mongoClient, mongoDB, typeCol } from '../../utils/db.js';
import handleResponse from '../../utils/handle-response.js';

function sendMainCard(roomId, personEmail) {
  try {
    let engagementTypes = [];
    mongoClient
      .db(mongoDB)
      .collection(typeCol)
      .find()
      .toArray(function (err, documents) {
        console.log('got engagementTypes');
        for (let doc of documents) {
          engagementTypes.push({ title: doc.type, value: doc.type });
        }
        mainCard.body[11].choices = engagementTypes;
        mainCard.body[11].value = engagementTypes[0]['value']; //preselect first item as value.  remove this line to default to --select-- placeholder in JSON card.
        mongoClient
          .db(mongoDB)
          .collection('access-controllers')
          .find()
          .toArray(async function (err, document) {
            for (let docs of document) {
              console.log(docs.controllers);
              if (docs.controllers.includes(personEmail)) {
                console.log('controllers include you', personEmail);
                mainCard.body[19].isVisible = true;
              } else {
                mainCard.body[19].isVisible = false;
              }
            }
          });
        sendWebexMessage(roomId, 'Engagement Request Form - Adaptive Card', mainCard);
      });
  } catch (err) {
    console.log('In sendMainCard' + err);
  }
}

function sendIntroSpaceMessage(roomId, actorId, inputs, links, note1, note2) {
  let msg = `<@personId:${actorId}|> has requested assistance with:  \n`;

  msg += `>**Engagement Type**: ${inputs.engagement_type}  \n`;
  msg += `>**Customer Name**: ${inputs.customer_name}  \n`;
  msg += `>**Geography**: ${inputs.geography}  \n`;
  msg += `>**Sales Level 2**: ${inputs.sales_level_2}  \n`;
  msg += `>**Sales Level 3**: ${inputs.sales_level_3}  \n`;
  msg += `>**Opportunity Link**: ${inputs.opportunity_link} \n`;
  msg += `>**Total Contract Value**: ${inputs.tcv_value} \n`;
  if (inputs.support_needed != null) {
    msg += `>**Support Needed**: ${inputs.support_needed}\n`;
  }
  msg += `>**Additional Comments**: ${inputs.comments}\n\n`;
  msg += `${note1}\n\n`;
  msg += `${note2}\n`;

  for (let link of links) {
    console.log(link);
    if (process.env.CCEP_LINK_ID == link._id.toString()) {
      const encodedName = encodeURIComponent(inputs.customer_name);
      const encodedLink = encodeURIComponent(inputs.opportunity_link);

      const queryParams = `?customer_name=${encodedName}&opportunity_link=${encodedLink}`;
      let url = link.url + queryParams;
      msg += `[${url}](${url})  \n`;
    } else {
      msg += `[${link.name}](${link.url})  \n`;
    }
  }
  return sendWebexMessage(roomId, msg);
}

function sendWebexMessage(roomId, message, card) {
  let payload = {
    roomId: roomId,
    markdown: message
  };
  if (card !== undefined) {
    payload.attachments = [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: card
      }
    ];
  }

  //TH - commented this out and added fetch below 7/23/24, because of a strange card spam error when trying to assign a user with the bot.
  // webex.messages.create(payload).then((res) => {
  //   console.log("sendWebexMessage complete", res);
  // }).catch((err) => {
  //   console.error(`error sending message card: ${err}`);
  // });

  fetch(`${process.env.WEBEX_API_URL}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.WEBEX_ACCESS_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
    .then((res) => {
      console.log('sendWebexMessage complete', res);
    })
    .catch((err) => {
      console.error(`error sending message card: ${err}`);
    });
}

async function updateMessage(messageId, roomId, card) {
  //card = JSON.stringify(card);
  const body = {
    roomId: roomId,
    text: 'This is an adaptive card',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: card
      }
    ]
  };
  // const body = {
  //   roomId: roomId,
  //   text: 'This is an adaptive card'
  // };
  console.log(body);
  return await fetch(`${process.env.WEBEX_API_URL}/messages/${messageId}`, {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer ' + process.env.WEBEX_ACCESS_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
    .then((r) => handleResponse(r))
    .then((r) => r.json())
    .then((r) => console.log('edited card', r))
    .catch((e) => console.log(e));
}

export { sendIntroSpaceMessage, sendMainCard, sendWebexMessage, updateMessage };
