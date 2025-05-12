import * as constants from '../../utils/constants.js';
import { updateMessage, sendWebexMessage } from '../general/messages.js';
import { updateListingName } from '../../utils/db.js';
import { removeMessage } from '../main.js';
import modifyTitleSubmitCard from '../../cards/modifyTitle/modifyTitleSubmitCard.json' assert { type: 'json' };

async function changeTitleRoute(roomId, messageId, inputs) {
  if (inputs.command == 'modify_title_step_1') {
    await sendRenameTitleCard(roomId, messageId, inputs);
  } else if (inputs.command == 'modify_title_step_2') {
    await submitRename(inputs);
    removeMessage(messageId);
    sendWebexMessage(roomId, `Thank you for your submission. Engagement type name has been updated.`);
  }
}
async function sendRenameTitleCard(roomId, messageId, inputs) {
  var listing = {
    type: inputs.team
  };
  modifyTitleSubmitCard.body[0].text = constants.TITLE;
  modifyTitleSubmitCard.body[1].text = constants.MODIFY_TEAM_NAME_TITLE;
  modifyTitleSubmitCard.body[3].label = constants.RENAME_TEAM_LABEL;
  modifyTitleSubmitCard.body[3].errorMessage = constants.RENAME_TEAM_ERROR_MESSAGE;
  modifyTitleSubmitCard.body[4].actions[1].data.listing = listing;
  await updateMessage(messageId, roomId, modifyTitleSubmitCard);
}

async function submitRename(inputs) {
  await updateListingName(inputs.listing.type, inputs.team_name);
}

export { changeTitleRoute };
