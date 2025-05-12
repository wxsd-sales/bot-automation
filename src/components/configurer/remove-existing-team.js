import removeTeamReviewCard from '../../cards/removeTeam/removeTeamReviewCard.json' assert { type: 'json' };
import { updateMessage, sendWebexMessage } from '../general/messages.js';
import { deleteListingByName } from '../../utils/db.js';
import * as constants from '../../utils/constants.js';
import { removeMessage } from '../main.js';

async function removeTeamRoute(roomId, messageId, inputs) {
  if (inputs.command == 'team_remove_review') {
    await teamRemoveReview(roomId, messageId, inputs);
  } else if (inputs.command == 'team_remove') {
    await teamRemove(inputs);
    removeMessage(messageId);
    sendWebexMessage(roomId, `Thank you for your submission. ${inputs.team} has been removed.`);
  }
}

async function teamRemove(inputs) {
  await deleteListingByName(inputs.team);
}

async function teamRemoveReview(roomId, messageId, inputs) {
  removeTeamReviewCard.body[0].text = constants.TITLE;
  removeTeamReviewCard.body[1].text = constants.REMOVE_TEAM_TITLE;
  removeTeamReviewCard.body[3].text = constants.REMOVE_CONFIRMATION_MSG;
  removeTeamReviewCard.body[4].facts[0].value = inputs.team;
  removeTeamReviewCard.body[5].actions[1].data.team = inputs.team;
  await updateMessage(messageId, roomId, removeTeamReviewCard);
}

export { removeTeamRoute };
