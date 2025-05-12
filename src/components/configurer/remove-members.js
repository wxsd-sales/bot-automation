import removeMembersSecondCard from '../../cards/removeMembers/removeMembersSecondCard.json' assert { type: 'json' };
import removeMembersReviewCard from '../../cards/removeMembers/removeMembersReviewCard.json' assert { type: 'json' };
import redirectCard from '../../cards/redirectCards/redirectCard.json' assert { type: 'json' };
import * as constants from '../../utils/constants.js';
import { updateMessage, sendWebexMessage } from '../general/messages.js';
import { getName } from '../general/get-person-details.js';
import { mongoClient, mongoDB, typeCol, removeArrayElement } from '../../utils/db.js';
import { removeMessage } from '../main.js';

async function removeMembersRoute(roomId, messageId, inputs) {
  if (inputs.command == 'member_remove_step_1') {
    await getMemberstoRemove(roomId, messageId, inputs);
  } else if (inputs.command == 'member_remove_step_2') {
    await removeMemberReview(roomId, messageId, inputs);
  } else if (inputs.command == 'member_remove_submit') {
    await membersRemove(inputs);
    removeMessage(messageId);
    sendWebexMessage(roomId, `Thank you for your submission. Members has been removed.`);
  }
}

async function getMemberstoRemove(roomId, messageId, inputs) {
  try {
    var existingMember = [];
    var listing = {
      type: inputs.team,
      emails: []
    };
    var teamId = null;
    let cursor = await mongoClient
      .db(mongoDB)
      .collection(typeCol)
      .aggregate([{ $match: { type: inputs.team } }]);
    let doc;
    if (await cursor.hasNext()) {
      doc = await cursor.next();
      console.log('doc:');
      console.log(doc);
      teamId = doc.team_id;
      if (doc.people != null) {
        for (let pers of doc.people) {
          console.log('email', pers.email);
          var name = await getName(pers.email).catch((e) => console.log('Error in getting name', e));
          existingMember.push({ title: name, value: pers.email });
        }
      }
    }
    if (existingMember.length == 0) {
      redirectCard.body[0].text = constants.TITLE;
      redirectCard.body[1].text = constants.NO_RESPONDERS;
      redirectCard.body[2].text = constants.NO_RESP_MSG;
      redirectCard.body[3].text = constants.REDIRECT_MSG;
      await updateMessage(messageId, roomId, redirectCard);
    } else {
      removeMembersSecondCard.body[0].text = constants.TITLE;
      removeMembersSecondCard.body[1].text = constants.REMOVE_MEMBERS_TITLE;
      removeMembersSecondCard.body[3].label = constants.REMOVE_MEM_RESP_LABEL;
      removeMembersSecondCard.body[3].errorMessage = constants.REMOVE_MEM_RESP_ERROR_MESSAGE;
      removeMembersSecondCard.body[3].choices = existingMember;
      removeMembersSecondCard.body[3].value = existingMember[0]['value']; //preselect first item as value.  remove this line to default to --select-- placeholder in JSON card.
      removeMembersSecondCard.body[4].actions[1].data.listing = listing;
      await updateMessage(messageId, roomId, removeMembersSecondCard);
    }
  } catch (err) {
    console.log('In getMemberstoRemove' + err);
  }
}

async function removeMemberReview(roomId, messageId, inputs) {
  try {
    var listing = inputs.listing;
    var members = '';
    const memberArray = inputs.members.split(',');
    for (let i = 0; i < memberArray.length; i++) {
      var name = await getName(memberArray[i]);
      members = members + memberArray[i] + ',';
      listing.emails.push(memberArray[i]);
      console.log(listing);
    }
    removeMembersSecondCard.body[0].text = constants.TITLE;
    removeMembersSecondCard.body[1].text = constants.REMOVE_MEMBERS_TITLE;
    removeMembersSecondCard.body[3].text = constants.REMOVE_CONFIRMATION_MSG;
    removeMembersReviewCard.body[4].facts[0].value = members;
    removeMembersReviewCard.body[6].facts[0].value = listing.type;
    removeMembersReviewCard.body[7].actions[1].data.listing = listing;
    await updateMessage(messageId, roomId, removeMembersReviewCard);
  } catch (err) {
    console.log('In removeMemberReview' + err);
  }
}

async function membersRemove(inputs) {
  var listing = inputs.listing;
  await removeArrayElement(listing.type, listing.emails);
}

export { removeMembersRoute };
