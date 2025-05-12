import * as cards from '../../cards/index.js';
import { updateMessage, sendWebexMessage } from '../general/messages.js';
import { getTeams } from '../general/get-team-details.js';
import { getName } from '../general/get-person-details.js';
import { mongoClient, mongoDB, typeCol } from '../../utils/db.js';
import * as constants from '../../utils/constants.js';

async function changeDB(roomId, messageId, inputs) {
  try {
    if (inputs.command == 'add_conf') {
      var teams = [];
      await getTeams().then((team) => {
        for (let i = 0; i < team.items.length; i++) {
          teams.push({ title: team.items[i].name, value: team.items[i].id });
        }
      });
      if (teams.length == 0) {
        cards.redirectCard.body[0].text = constants.TITLE;
        cards.redirectCard.body[1].text = constants.NO_WEBEX_TEAM;
        cards.redirectCard.body[2].text = constants.NO_WEBEX_TEAM_MSG;
        cards.redirectCard.body[3].text = constants.REDIRECT_MSG;
        sendWebexMessage(roomId, 'Add Team adaptive Card', cards.redirectCard);
      } else {
        cards.addTeamFirstCard.body[0].text = constants.TITLE;
        cards.addTeamFirstCard.body[1].text = constants.ADD_TEAM_TITLE;
        cards.addTeamFirstCard.body[3].label = constants.TEAM_NAME_LABEL;
        cards.addTeamFirstCard.body[3].placeholder = constants.TEAM_NAME_PLACEHOLDER;
        cards.addTeamFirstCard.body[3].errorMessage = constants.TEAM_NAME_ERROR_MESSAGE;
        cards.addTeamFirstCard.body[4].label = constants.TEAM_ID_LABEL;
        cards.addTeamFirstCard.body[4].errorMessage = constants.TEAM_ID_ERROR_MESSAGE;
        cards.addTeamFirstCard.body[4].choices = teams;
        cards.addTeamFirstCard.body[4].value = teams[0]['value'];
        cards.addTeamFirstCard.body[5].label = constants.SHORT_NAME_LABEL;
        cards.addTeamFirstCard.body[5].errorMessage = constants.SHORT_NAME_ERROR_MESSAGE;
        cards.addTeamFirstCard.body[6].label = constants.NOTE_1_LABEL;
        cards.addTeamFirstCard.body[6].value = constants.NOTE_1_VALUE;
        cards.addTeamFirstCard.body[7].label = constants.NOTE_2_LABEL;
        cards.addTeamFirstCard.body[7].value = constants.NOTE_2_VALUE;
        cards.addTeamFirstCard.body[8].actions[0].card.body[0].facts = constants.FIRST_CARD_FACTS;
        sendWebexMessage(roomId, 'Add Team adaptive Card', cards.addTeamFirstCard);
      }
    } else if (inputs.command == 'modify_conf') {
      cards.modifyMainCard.body[0].text = constants.TITLE;
      cards.modifyMainCard.body[1].text = constants.MODIFY_MAIN_TITLE;
      cards.modifyMainCard.body[2].actions[0].title = constants.MODIFY_MAIN_OPTION_1;
      cards.modifyMainCard.body[2].actions[1].title = constants.MODIFY_MAIN_OPTION_2;
      cards.modifyMainCard.body[2].actions[2].title = constants.MODIFY_MAIN_OPTION_3;
      sendWebexMessage(roomId, 'Add Team adaptive Card', cards.modifyMainCard);
    } else if (inputs.command == 'remove_conf') {
      var teams = [];
      mongoClient
        .db(mongoDB)
        .collection(typeCol)
        .find()
        .toArray(function (err, documents) {
          console.log('got engagementTypes');
          for (let doc of documents) {
            teams.push({ title: doc.type, value: doc.type });
          }
          cards.removeTeamCard.body[0].text = constants.TITLE;
          cards.removeTeamCard.body[1].text = constants.REMOVE_TEAM_TITLE;
          cards.removeTeamCard.body[3].label = constants.REMOVE_TEAM_LABEL;
          cards.removeTeamCard.body[3].errorMessage = constants.REMOVE_TEAM_ERROR_MESSAGE;
          cards.removeTeamCard.body[3].choices = teams;
          cards.removeTeamCard.body[3].value = teams[0]['value']; //preselect first item as value.  remove this line to default to --select-- placeholder in JSON card.
          sendWebexMessage(roomId, 'Add Team adaptive Card', cards.removeTeamCard);
        });
    }
  } catch (err) {
    console.log('In changeDB' + err);
  }
}

async function modify(roomId, messageId, inputs) {
  if (inputs.command == 'modify_members') {
    cards.modifyMembersCard.body[0].text = constants.TITLE;
    cards.modifyMembersCard.body[1].text = constants.MODIFY_MEM_MAIN_TITLE;
    cards.modifyMembersCard.body[2].choices[0].title = constants.MODIFY_MEM_MAIN_OPTION_1;
    cards.modifyMembersCard.body[2].choices[1].title = constants.MODIFY_MEM_MAIN_OPTION_2;
    cards.modifyMembersCard.body[2].choices[2].title = constants.MODIFY_MEM_MAIN_OPTION_3;
    cards.modifyMembersCard.body[2].label = constants.MODIFY_MEM_MAIN_LABEL;
    await updateMessage(messageId, roomId, cards.modifyMembersCard);
  } else if (inputs.command == 'modify_links') {
    cards.modifyLinksCard.body[0].text = constants.TITLE;
    cards.modifyLinksCard.body[1].text = constants.MODIFY_LINKS_MAIN_TITLE;
    cards.modifyLinksCard.body[2].choices[0].title = constants.MODIFY_LINKS_MAIN_OPTION_1;
    cards.modifyLinksCard.body[2].choices[1].title = constants.MODIFY_LINKS_MAIN_OPTION_2;
    cards.modifyLinksCard.body[2].label = constants.MODIFY_LINKS_MAIN_LABEL;
    await updateMessage(messageId, roomId, cards.modifyLinksCard);
  } else if (inputs.command == 'modify_other_details') {
    cards.modifyTeamDetailsCard.body[0].text = constants.TITLE;
    cards.modifyTeamDetailsCard.body[1].text = constants.MODIFY_TEAM_DETAILS_MAIN_TITLE;
    cards.modifyTeamDetailsCard.body[2].choices[0].title = constants.MODIFY_TEAM_DETAILS_MAIN_OPTION_1;
    cards.modifyTeamDetailsCard.body[2].choices[1].title = constants.MODIFY_TEAM_DETAILS_MAIN_OPTION_2;
    cards.modifyTeamDetailsCard.body[2].label = constants.MODIFY_TEAM_DETAILS_MAIN_LABEL;
    await updateMessage(messageId, roomId, cards.modifyTeamDetailsCard);
  }
}

async function modifyTeam(roomId, messageId, inputs) {
  if (inputs.activity == 'add_members') {
    cards.addMembersFirstCard.body[0].text = constants.TITLE;
    cards.addMembersFirstCard.body[1].text = constants.ADD_MEMBERS_TITLE;
    cards.addMembersFirstCard.body[3].label = constants.ADD_MEM_TEAM_LABEL;
    cards.addMembersFirstCard.body[3].errorMessage = constants.ADD_MEM_TEAM_ERROR_MESSAGE;
    await teamCard(roomId, messageId, cards.addMembersFirstCard);
  } else if (inputs.activity == 'remove_members') {
    cards.removeMembersFirstCard.body[0].text = constants.TITLE;
    cards.removeMembersFirstCard.body[1].text = constants.REMOVE_MEMBERS_TITLE;
    cards.removeMembersFirstCard.body[3].label = constants.REMOVE_MEM_TEAM_LABEL;
    cards.removeMembersFirstCard.body[3].errorMessage = constants.REMOVE_MEM_TEAM_ERROR_MESSAGE;
    await teamCard(roomId, messageId, cards.removeMembersFirstCard);
  } else if (inputs.activity == 'update_members') {
    cards.changeModerationFirstCard.body[0].text = constants.TITLE;
    cards.changeModerationFirstCard.body[1].text = constants.CHANGE_MOD_TITLE;
    cards.changeModerationFirstCard.body[3].label = constants.CHNAGE_MOD_TEAM_LABEL;
    cards.changeModerationFirstCard.body[3].errorMessage = constants.CHANGE_MOD_TEAM_ERROR_MESSAGE;
    await teamCard(roomId, messageId, cards.changeModerationFirstCard);
  } else if (inputs.activity == 'add_links') {
    cards.addLinksFirstCard.body[0].text = constants.TITLE;
    cards.addLinksFirstCard.body[1].text = constants.ADD_LINKS_TITLE;
    cards.addLinksFirstCard.body[3].label = constants.ADD_LINKS_TEAM_LABEL;
    cards.addLinksFirstCard.body[3].errorMessage = constants.ADD_LINKS_TEAM_ERROR_MESSAGE;
    await teamCard(roomId, messageId, cards.addLinksFirstCard);
  } else if (inputs.activity == 'remove_links') {
    cards.removeLinksFirstCard.body[0].text = constants.TITLE;
    cards.removeLinksFirstCard.body[1].text = constants.REMOVE_LINKS_TITLE;
    cards.removeLinksFirstCard.body[3].label = constants.REMOVE_LINKS_TEAM_LABEL;
    cards.removeLinksFirstCard.body[3].errorMessage = constants.REMOVE_LINKS_TEAM_ERROR_MESSAGE;
    await teamCard(roomId, messageId, cards.removeLinksFirstCard);
  } else if (inputs.activity == 'modify_title') {
    cards.modifyTitleFirstCard.body[0].text = constants.TITLE;
    cards.modifyTitleFirstCard.body[1].text = constants.MODIFY_TEAM_NAME_TITLE;
    cards.modifyTitleFirstCard.body[3].label = constants.MODIFY_TEAM_NAME_LABEL;
    cards.modifyTitleFirstCard.body[3].errorMessage = constants.MODIFY_TEAM_NAME_ERROR_MESSAGE;
    await teamCard(roomId, messageId, cards.modifyTitleFirstCard);
  } else if (inputs.activity == 'modify_notes') {
    cards.modifyNotesFirstCard.body[0].text = constants.TITLE;
    cards.modifyNotesFirstCard.body[1].text = constants.MODIFY_NOTES_TITLE;
    cards.modifyNotesFirstCard.body[3].label = constants.MODIFY_NOTES_LABEL;
    cards.modifyNotesFirstCard.body[3].errorMessage = constants.MODIFY_NOTES_ERROR_MESSAGE;
    await teamCard(roomId, messageId, cards.modifyNotesFirstCard);
  }
}

async function teamCard(roomId, messageId, card) {
  try {
    var teams = [];
    mongoClient
      .db(mongoDB)
      .collection(typeCol)
      .find()
      .toArray(async function (err, documents) {
        console.log('got engagementTypes');
        for (let doc of documents) {
          teams.push({ title: doc.type, value: doc.type });
        }
        card.body[3].choices = teams;
        card.body[3].value = teams[0]['value']; //preselect first item as value.  remove this line to default to --select-- placeholder in JSON card.
        await updateMessage(messageId, roomId, card);
      });
  } catch (err) {
    console.log('In teamCard' + err);
  }
}

async function changeModeration(roomId, messageId, inputs) {
  if (inputs.activity == 'add_mod') {
    cards.changeModAddCard.body[0].text = constants.TITLE;
    cards.changeModAddCard.body[1].text = constants.CHANGE_MOD_TITLE;
    cards.changeModAddCard.body[3].label = constants.ADD_MOD_LABEL;
    cards.changeModAddCard.body[3].errorMessage = constants.ADD_MOD_ERROR_MESSAGE;
    await modType(roomId, messageId, inputs, false, cards.changeModAddCard);
  } else if (inputs.activity == 'remove_mod') {
    cards.changeModRemoveCard.body[0].text = constants.TITLE;
    cards.changeModRemoveCard.body[1].text = constants.CHANGE_MOD_TITLE;
    cards.changeModRemoveCard.body[3].label = constants.REMOVE_MOD_LABEL;
    cards.changeModRemoveCard.body[3].errorMessage = constants.REMOVE_MOD_ERROR_MESSAGE;
    await modType(roomId, messageId, inputs, true, cards.changeModRemoveCard);
  }
}

async function modType(roomId, messageId, inputs, isModerator, card) {
  try {
    var members = [];
    let cursor = await mongoClient
      .db(mongoDB)
      .collection(typeCol)
      .aggregate([{ $match: { type: inputs.listing.type } }]);
    let doc;
    if (await cursor.hasNext()) {
      doc = await cursor.next();
      console.log('doc:');
      console.log(doc);
      for (let pers of doc.people) {
        console.log(pers.isModerator);
        if (pers.isModerator == isModerator) {
          var name = await getName(pers.email);
          members.push({ title: name, value: pers.email });
        }
      }
    }
    console.log(members);
    if (members.length == 0 && isModerator == false) {
      //add-mod card
      cards.redirectCard.body[0].text = constants.TITLE;
      cards.redirectCard.body[1].text = constants.NO_NON_MODERATORS;
      cards.redirectCard.body[2].text = constants.NO_NON_MODERATORS_MSG;
      cards.redirectCard.body[3].text = constants.REDIRECT_MSG;
      await updateMessage(messageId, roomId, cards.redirectCard);
    } else if (members.length == 0 && isModerator == true) {
      //remove-mod card
      //add-mod card
      cards.redirectCard.body[0].text = constants.TITLE;
      cards.redirectCard.body[1].text = constants.NO_MODERATORS;
      cards.redirectCard.body[2].text = constants.NO_MODERATORS_MSG;
      cards.redirectCard.body[3].text = constants.REDIRECT_MSG;
      await updateMessage(messageId, roomId, cards.redirectCard);
    } else {
      card.body[3].choices = members;
      card.body[3].value = members[0]['value']; //preselect first item as value.  remove this line to default to --select-- placeholder in JSON card.
      card.body[4].actions[1].data.listing = inputs.listing;
      await updateMessage(messageId, roomId, card);
    }
  } catch (err) {
    console.log('In modType' + err);
  }
}
export { changeDB, modifyTeam, changeModeration, modify };
