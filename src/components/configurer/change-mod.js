import * as cards from '../../cards/index.js';
import { updateMessage, sendWebexMessage } from '../general/messages.js';
import { updateListingByName, removeArrayElement } from '../../utils/db.js';
import * as constants from '../../utils/constants.js';
import { changeModeration } from './change-db.js';
import { removeMessage } from '../main.js';

async function changeModRoute(roomId, messageId, inputs) {
  if (inputs.command == 'change_mod_step_1') {
    await selectModeration(roomId, messageId, inputs);
  } else if (inputs.command == 'change_mod_step_2') {
    await changeModeration(roomId, messageId, inputs);
  } else if (inputs.command == 'change_mod_add_step_1') {
    cards.changeModAddReviewCard.body[0].text = constants.TITLE;
    cards.changeModAddReviewCard.body[1].text = constants.CHANGE_MOD_TITLE;
    cards.changeModAddReviewCard.body[3].text = constants.ADD_CONFIRMATION_MSG;
    await changeModReview(roomId, messageId, inputs, cards.changeModAddReviewCard, true);
  } else if (inputs.command == 'change_mod_add_submit' || inputs.command == 'change_mod_remove_submit') {
    await changeModSubmit(inputs);
    removeMessage(messageId);
    sendWebexMessage(roomId, `Thank you for your submission. Moderation has been updated.`);
  } else if (inputs.command == 'change_mod_remove_step1') {
    cards.changeModRemoveReviewCard.body[0].text = constants.TITLE;
    cards.changeModRemoveReviewCard.body[1].text = constants.CHANGE_MOD_TITLE;
    cards.changeModRemoveReviewCard.body[3].text = constants.REMOVE_CONFIRMATION_MSG;
    await changeModReview(roomId, messageId, inputs, cards.changeModRemoveReviewCard, false);
  }
}

async function selectModeration(roomId, messageId, inputs) {
  var listing = {
    type: inputs.team,
    people: [{}]
  };
  cards.changeModerationSecondCard.body[0].text = constants.TITLE;
  cards.changeModerationSecondCard.body[1].text = constants.CHANGE_MOD_TITLE;
  cards.changeModerationSecondCard.body[3].label = constants.CHNAGE_MOD_ACTIVITY_LABEL;
  cards.changeModerationSecondCard.body[3].errorMessage = constants.CHANGE_MOD_ACTIVITY_ERROR_MESSAGE;
  cards.changeModerationSecondCard.body[4].actions[1].data.listing = listing;
  await updateMessage(messageId, roomId, cards.changeModerationSecondCard);
}

async function changeModReview(roomId, messageId, inputs, card, isModerator) {
  var listing = inputs.listing;
  const moderatorArray = inputs.moderator.split(',');
  for (let i = 0; i < moderatorArray.length; i++) {
    listing.people[i] = { email: '', isModerator: false };
    listing.people[i].email = moderatorArray[i];
    listing.people[i].isModerator = isModerator;
    console.log('listing', listing);
  }
  card.body[4].facts[0].value = inputs.moderator;
  card.body[6].facts[0].value = listing.type;
  card.body[7].actions[1].data.listing = listing;
  await updateMessage(messageId, roomId, card);
}

async function changeModSubmit(inputs) {
  var listing = inputs.listing;
  var email = [];
  listing.people.forEach((people) => {
    email.push(people.email);
  });
  await removeArrayElement(listing.type, email);
  await updateListingByName(listing.type, listing.people);
}

export { selectModeration, changeModReview, changeModSubmit, changeModRoute };
