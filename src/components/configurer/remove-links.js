import removeLinksSecondCard from '../../cards/removeLinks/removeLinksSecondCard.json' assert { type: 'json' };
import redirectCard from '../../cards/redirectCards/redirectCard.json' assert { type: 'json' };
import * as constants from '../../utils/constants.js';
import { updateMessage, sendWebexMessage } from '../general/messages.js';
import { mongoClient, mongoDB, typeCol, removeLinks } from '../../utils/db.js';
import { removeMessage } from '../main.js';
import { ObjectId } from 'bson';

async function removeLinksRoute(roomId, messageId, inputs) {
  if (inputs.command == 'links_remove_step_1') {
    await getLinkstoRemove(roomId, messageId, inputs);
  } else if (inputs.command == 'links_remove_step_2') {
    await removeLinksReview(roomId, messageId, inputs);
    removeMessage(messageId);
    sendWebexMessage(roomId, `Thank you for your submission. Links has been removed.`);
  }
}

async function getLinkstoRemove(roomId, messageId, inputs) {
  try {
    var existingLinks = [];
    var links = [];
    var listing = {
      type: inputs.team,
      links: []
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
      if (doc.links != null) {
        doc.links.forEach((element) => {
          existingLinks.push(element);
        });
      }
    }
    mongoClient
      .db(mongoDB)
      .collection('links')
      .find()
      .toArray(async function (err, documents) {
        console.log('got engagementTypes');
        for (let doc of documents) {
          existingLinks.forEach((exlink) => {
            console.log(exlink);

            if (exlink.equals(doc._id)) {
              console.log('links', doc._id);
              links.push({ title: doc.name, value: doc._id });
            }
          });
        }
        if (links.length == 0) {
          redirectCard.body[0].text = constants.TITLE;
          redirectCard.body[1].text = constants.NO_LINKS_TO_REMOVE;
          redirectCard.body[2].text = constants.NO_LINKS_TO_REMOVE_MSG;
          redirectCard.body[3].text = constants.REDIRECT_MSG;
          await updateMessage(messageId, roomId, redirectCard);
        } else {
          removeLinksSecondCard.body[0].text = constants.TITLE;
          removeLinksSecondCard.body[1].text = constants.REMOVE_LINKS_TITLE;
          removeLinksSecondCard.body[3].label = constants.REMOVE_LINKS_LABEL;
          removeLinksSecondCard.body[3].errorMessage = constants.REMOVE_LINKS_ERROR_MESSAGE;
          removeLinksSecondCard.body[3].choices = links;
          removeLinksSecondCard.body[3].value = links[0]['value']; //preselect first item as value.  remove this line to default to --select-- placeholder in JSON card.
          removeLinksSecondCard.body[4].actions[1].data.listing = listing;
          await updateMessage(messageId, roomId, removeLinksSecondCard);
        }
      });
  } catch (err) {
    console.error('In getLinkstoRemove' + err);
  }
}

async function removeLinksReview(roomId, messageId, inputs) {
  try {
    var listing = inputs.listing;
    var links = '';
    const linksArray = inputs.links.split(',');
    for (let i = 0; i < linksArray.length; i++) {
      links = links + linksArray[i] + ',';
      var link = new ObjectId(linksArray[i]);
      listing.links.push(link);
      console.log(listing);
    }
    await removeLinks(listing.type, listing.links);
  } catch (err) {
    console.error('In removeLinksReview' + err);
  }
}

export { removeLinksRoute };
