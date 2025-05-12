import { updateMessage, sendWebexMessage } from '../general/messages.js';
import { removeMessage } from '../main.js';
import { mongoClient, mongoDB, typeCol, updateListingLinks } from '../../utils/db.js';
import { ObjectId } from 'mongodb';
import addLinksSecondCard from '../../cards/addLinks/addLinksSecondCard.json' assert { type: 'json' };
import redirectCard from '../../cards/redirectCards/redirectCard.json' assert { type: 'json' };
import * as constants from '../../utils/constants.js';

async function addNewLinksRoute(roomId, messageId, inputs) {
  if (inputs.command == 'links_add_step_1') {
    await getNewLinks(roomId, messageId, inputs);
  } else if (inputs.command == 'links_add_step_2') {
    await getNewLinksDetails(roomId, messageId, inputs);
    removeMessage(messageId);
    sendWebexMessage(roomId, `Thank you for your submission. New Links have been added.`);
  }
}

async function getNewLinks(roomId, messageId, inputs) {
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
      teamId = doc.team_id;
      if (doc.links != null) {
        doc.links.forEach((element) => {
          existingLinks.push(element.toString());
        });
      }
    }
    mongoClient
      .db(mongoDB)
      .collection('links')
      .find()
      .toArray(async function (err, documents) {
        for (let doc of documents) {
          if (!existingLinks.includes(doc._id.toString())) {
            links.push({ title: doc.name, value: new ObjectId(doc._id) });
          }
        }
        if (links.length == 0) {
          redirectCard.body[0].text = constants.TITLE;
          redirectCard.body[1].text = constants.NO_ADDITIONAL_LINKS;
          redirectCard.body[2].text = constants.NO_ADDITIONAL_LINKS_MSG;
          redirectCard.body[3].text = constants.REDIRECT_MSG;
          await updateMessage(messageId, roomId, redirectCard);
        } else {
          addLinksSecondCard.body[0].text = constants.TITLE;
          addLinksSecondCard.body[1].text = constants.ADD_LINKS_TITLE;
          addLinksSecondCard.body[3].label = constants.ADD_LINKS_LABEL;
          addLinksSecondCard.body[3].errorMessage = constants.ADD_LINKS_ERROR_MESSAGE;
          addLinksSecondCard.body[3].choices = links;
          addLinksSecondCard.body[3].value = links[0]['value']; //preselect first item as value.  remove this line to default to --select-- placeholder in JSON card.
          addLinksSecondCard.body[4].actions[1].data.listing = listing;
          await updateMessage(messageId, roomId, addLinksSecondCard);
        }
      });
  } catch (err) {
    console.error('In getNewLinks' + err);
  }
}

async function getNewLinksDetails(roomId, messageId, inputs) {
  try {
    var listing = inputs.listing;
    const linksArray = inputs.links.split(',');

    for (let i = 0; i < linksArray.length; i++) {
      var link = new ObjectId(linksArray[i]);
      listing.links.push(link);
      console.log(listing);
    }
    await updateListingLinks(listing.type, listing.links);
  } catch (err) {
    console.error('In getNewLinksDetails' + err);
  }
}

export { addNewLinksRoute };
