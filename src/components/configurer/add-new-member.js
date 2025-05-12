import * as cards from '../../cards/index.js';
import * as constants from '../../utils/constants.js';
import { updateMessage, sendWebexMessage } from '../general/messages.js';
import { getTeamMemberships } from '../general/get-team-details.js';
import { getName } from '../general/get-person-details.js';
import { removeMessage } from '../main.js';
import { mongoClient, mongoDB, updateListingByName, typeCol } from '../../utils/db.js';

async function addNewMemberRoute(roomId, messageId, inputs) {
  if (inputs.command == 'member_add_step_1') {
    await getNewMembers(roomId, messageId, inputs);
  } else if (inputs.command == 'member_add_step_2') {
    await getNewMembersisModerator(roomId, messageId, inputs);
  } else if (inputs.command == 'member_add_step_3') {
    await getNewMembersDetails(roomId, messageId, inputs);
  } else if (inputs.command == 'member_add_submit') {
    await submitNewMember(roomId, messageId, inputs);
    removeMessage(messageId);
    sendWebexMessage(roomId, `Thank you for your submission. New members have been added.`);
  }
}

async function getNewMembers(roomId, messageId, inputs) {
  try {
    var existingMember = [];
    var members = [];
    var listing = {
      type: inputs.team,
      people: [{}]
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
          existingMember.push(pers.email);
        }
      }
    }
    await getTeamMemberships(teamId).then((team) => {
      for (let i = 0; i < team.items.length; i++) {
        if (!existingMember.includes(team.items[i].personEmail) && !team.items[i].personEmail.includes('webex.bot'))
          members.push({ title: team.items[i].personDisplayName, value: team.items[i].personEmail });
      }
    });
    if (members.length == 0) {
      cards.redirectCard.body[0].text = constants.TITLE;
      cards.redirectCard.body[1].text = constants.NO_ADDITIONAL_RESPONDERS;
      cards.redirectCard.body[2].text = constants.NO_ADDITIONAL_RESP_MSG;
      cards.redirectCard.body[3].text = constants.REDIRECT_MSG;
      await updateMessage(messageId, roomId, cards.redirectCard);
    } else {
      cards.addMembersSecondCard.body[0].text = constants.TITLE;
      cards.addMembersSecondCard.body[1].text = constants.ADD_MEMBERS_TITLE;
      cards.addMembersSecondCard.body[3].label = constants.ADD_MEM_RESP_LABEL;
      cards.addMembersSecondCard.body[3].errorMessage = constants.ADD_MEM_RESP_ERROR_MESSAGE;
      cards.addMembersSecondCard.body[3].choices = members;
      cards.addMembersSecondCard.body[3].value = members[0]['value']; //preselect first item as value.  remove this line to default to --select-- placeholder in JSON card.
      cards.addMembersSecondCard.body[4].actions[1].data.listing = listing;
      await updateMessage(messageId, roomId, cards.addMembersSecondCard);
    }
  } catch (err) {
    console.error('In getNewMembers' + err);
  }
}

async function getNewMembersisModerator(roomId, messageId, inputs) {
  try {
    var listing = inputs.listing;
    var members = [];
    const memberArray = inputs.members.split(',');
    for (let i = 0; i < memberArray.length; i++) {
      listing.people[i] = { email: '', isModerator: false };
      console.log('personId', memberArray[i]);
      var name = await getName(memberArray[i]);
      members.push({ title: name, value: memberArray[i] });
      listing.people[i].email = memberArray[i];
      listing.people[i].isModerator = false;
      console.log(listing);
    }
    cards.addMembersThirdCard.body[0].text = constants.TITLE;
    cards.addMembersThirdCard.body[1].text = constants.ADD_MEMBERS_TITLE;
    cards.addMembersThirdCard.body[3].label = constants.ADD_MEM_MOD_LABEL;
    cards.addMembersThirdCard.body[3].errorMessage = constants.ADD_MEM_MOD_ERROR_MESSAGE;
    cards.addMembersThirdCard.body[3].choices = members;
    cards.addMembersThirdCard.body[3].value = members[0]['value'];
    cards.addMembersThirdCard.body[4].actions[1].data.listing = listing;
    await updateMessage(messageId, roomId, cards.addMembersThirdCard);
  } catch (err) {
    console.error(' In getNewMembersisModerator' + err);
  }
}

async function getNewMembersDetails(roomId, messageId, inputs) {
  try {
    var listing = inputs.listing;
    const moderatorArray = inputs.moderators.split(',');

    for (let i = 0; i < listing.people.length; i++) {
      var person = listing.people[i].email;
      for (let j = 0; j < moderatorArray.length; j++) {
        if (person == moderatorArray[j]) {
          listing.people[i].isModerator = true;
        }
      }
      console.log(listing);
    }
    var responders = '';
    var moderators = '';
    cards.addMembersThirdCard.body[0].text = constants.TITLE;
    cards.addMembersThirdCard.body[1].text = constants.ADD_MEMBERS_TITLE;
    cards.addMembersReviewCard.body[3].facts[0].value = listing.type;
    for (let i = 0; i < listing.people.length; i++) {
      responders = responders + listing.people[i].email + ',';
      if (listing.people[i].isModerator == true) {
        moderators = moderators + listing.people[i].email + ',';
      }
    }
    cards.addMembersReviewCard.body[3].facts[1].value = responders;
    cards.addMembersReviewCard.body[3].facts[2].value = moderators;
    cards.addMembersReviewCard.body[4].actions[1].data.listing = listing;
    await updateMessage(messageId, roomId, cards.addMembersReviewCard);
  } catch (err) {
    console.error('In getNewMembersDetails' + err);
  }
}

async function submitNewMember(roomId, messageId, inputs) {
  try {
    var listing = inputs.listing;
    await updateListingByName(listing.type, listing.people);
  } catch (err) {
    console.error('In submitNewMember' + err);
  }
}

export { addNewMemberRoute };
