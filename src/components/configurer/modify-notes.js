import * as constants from '../../utils/constants.js';
import { updateMessage, sendWebexMessage } from '../general/messages.js';
import { updateListingNotes } from '../../utils/db.js';
import { removeMessage } from '../main.js';
import modifyNotesSubmitCard from '../../cards/modifyNotes/modifyNotesSubmitCard.json' assert { type: 'json' };

async function modifyNotesRoute(roomId, messageId, inputs) {
  if (inputs.command == 'modify_notes_step_1') {
    await sendModifyNotesCard(roomId, messageId, inputs);
  } else if (inputs.command == 'modify_notes_step_2') {
    await submitNotes(inputs);
    removeMessage(messageId);
    sendWebexMessage(roomId, `Thank you for your submission. Notes have been updated.`);
  }
}
async function sendModifyNotesCard(roomId, messageId, inputs) {
  var listing = {
    type: inputs.team
  };
  modifyNotesSubmitCard.body[0].text = constants.TITLE;
  modifyNotesSubmitCard.body[1].text = constants.MODIFY_NOTES_TITLE;
  modifyNotesSubmitCard.body[3].label = constants.NOTE_1_LABEL;
  modifyNotesSubmitCard.body[3].value = constants.NOTE_1_VALUE;
  modifyNotesSubmitCard.body[4].label = constants.NOTE_2_LABEL;
  modifyNotesSubmitCard.body[4].value = constants.NOTE_2_VALUE;
  modifyNotesSubmitCard.body[3].errorMessage = constants.ENTER_NOTES_ERROR_MESSAGE;
  modifyNotesSubmitCard.body[4].errorMessage = constants.ENTER_NOTES_ERROR_MESSAGE;
  modifyNotesSubmitCard.body[5].actions[1].data.listing = listing;
  await updateMessage(messageId, roomId, modifyNotesSubmitCard);
}

async function submitNotes(inputs) {
  await updateListingNotes(inputs.listing.type, inputs.note1, inputs.note2);
}

export { modifyNotesRoute };
