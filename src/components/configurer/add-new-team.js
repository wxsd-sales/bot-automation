import * as cards from '../../cards/index.js';
import * as constants from '../../utils/constants.js';
import { sendWebexMessage, updateMessage } from '../general/messages.js';
import { removeMessage } from '../main.js';
import { getTeamMemberships } from '../general/get-team-details.js';
import { getName } from '../general/get-person-details.js';
import { mongoClient, mongoDB, createListing } from '../../utils/db.js';
import { ObjectId } from 'bson';

async function addTeamRoute(roomId, messageId, inputs) {
  if (inputs.command == 'team_add_step_1') {
    await teamAdd(roomId, messageId, inputs);
  } else if (inputs.command == 'team_add_step_2') {
    await addMembers(roomId, messageId, inputs);
  } else if (inputs.command == 'team_add_step_3') {
    await addModerators(roomId, messageId, inputs);
  } else if (inputs.command == 'team_add_review') {
    await teamAddReview(roomId, messageId, inputs);
    removeMessage(messageId);
    sendWebexMessage(roomId, `Thank you for your submission. New team has been added.`);
  }
}

async function teamAdd(roomId, messageId, inputs) {
  try {
    var members = [];
    var listing = {
      type: inputs.team_name,
      short_name: inputs.short_name,
      team_id: inputs.team_id,
      note1: inputs.note1,
      note2: inputs.note2,
      people: [{}],
      links: [],
      sheet: new ObjectId(process.env.SHEET_ID)
    };
    await getTeamMemberships(inputs.team_id).then((team) => {
      for (let i = 0; i < team.items.length; i++) {
        if (!team.items[i].personEmail.includes('webex.bot'))
          members.push({ title: team.items[i].personDisplayName, value: team.items[i].personEmail });
      }
    });
    if (members.length == 0) {
      cards.redirectCard.body[0].text = constants.TITLE;
      cards.redirectCard.body[1].text = constants.NO_TEAM_MEMBERSHIPS;
      cards.redirectCard.body[2].text = constants.NO_TEAM_MEMBERSHIPS_MSG;
      cards.redirectCard.body[3].text = constants.REDIRECT_MSG;
      await updateMessage(messageId, roomId, cards.redirectCard);
    } else {
      cards.addTeamSecondCard.body[0].text = constants.TITLE;
      cards.addTeamSecondCard.body[1].text = constants.ADD_TEAM_TITLE;
      cards.addTeamSecondCard.body[3].label = constants.DEFAULT_RESP_LABEL;
      cards.addTeamSecondCard.body[3].errorMessage = constants.DEAFULT_RESP_ERROR_MESSAGE;
      cards.addTeamSecondCard.body[3].choices = members;
      cards.addTeamSecondCard.body[3].value = members[0]['value'];
      cards.addTeamSecondCard.body[4].actions[0].card.body[0].text = constants.DEFAULT_RESP_DEF;
      cards.addTeamSecondCard.body[5].actions[1].data.listing = listing;
      await updateMessage(messageId, roomId, cards.addTeamSecondCard);
    }
  } catch (err) {
    console.log('In teamAdd' + err);
  }
}

async function addMembers(roomId, messageId, inputs) {
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
    cards.addTeamThirdCard.body[0].text = constants.TITLE;
    cards.addTeamThirdCard.body[1].text = constants.ADD_TEAM_TITLE;
    cards.addTeamThirdCard.body[3].label = constants.DEFAULT_MOD_LABEL;
    cards.addTeamThirdCard.body[3].errorMessage = constants.DEFAULT_MOD_ERROR_MESSAGE;
    cards.addTeamThirdCard.body[3].choices = members;
    cards.addTeamThirdCard.body[3].value = members[0]['value'];
    cards.addTeamThirdCard.body[4].actions[0].card.body[0].text = constants.DEFAULT_MOD_DEF;
    cards.addTeamThirdCard.body[5].actions[1].data.listing = listing;
    await updateMessage(messageId, roomId, cards.addTeamThirdCard);
  } catch (err) {
    console.log('In addMembers' + err);
  }
}

async function addModerators(roomId, messageId, inputs) {
  try {
    var listing = inputs.listing;
    var links = [];
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
    mongoClient
      .db(mongoDB)
      .collection('links')
      .find()
      .toArray(async function (err, documents) {
        console.log('got engagementTypes');
        for (let doc of documents) {
          links.push({ title: doc.name, value: new ObjectId(doc._id) });
        }
        cards.addTeamFourthCard.body[0].text = constants.TITLE;
        cards.addTeamFourthCard.body[1].text = constants.ADD_TEAM_TITLE;
        cards.addTeamFourthCard.body[3].label = constants.LINKS_LABEL;
        cards.addTeamFourthCard.body[3].choices = links;
        cards.addTeamFourthCard.body[3].value = links[0]['value'];
        cards.addTeamFourthCard.body[4].actions[0].card.body[0].text = constants.LINKS_DEF;
        cards.addTeamFourthCard.body[5].actions[1].data.listing = listing;
        await updateMessage(messageId, roomId, cards.addTeamFourthCard);
      });
  } catch (err) {
    console.log('In addModerators' + err);
  }
}

async function teamAddReview(roomId, messageId, inputs) {
  try {
    var listing = inputs.listing;
    const links = inputs.links.split(',');
    for (let i = 0; i < links.length; i++) {
      var id = new ObjectId(links[i]);
      listing.links.push(id);
      console.log('listing', listing);
    }
    await createListing(listing);
  } catch (err) {
    console.log('In teamAddReview' + err);
  }
}

export { addTeamRoute };
