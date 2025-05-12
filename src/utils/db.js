/* IMPORTS */

import { config } from 'dotenv';
config();
import { MongoClient } from 'mongodb';

/* RUNTIME VARS */
const mongoUri = `${process.env.MONGO_URI}/${process.env.MONGO_DB}?retryWrites=true&w=majority`;
const mongoClient = new MongoClient(mongoUri);
const mongoDB = process.env.MONGO_DB;
const typeCol = 'type';

/*FUNCTIONS*/
async function createListing(jsonObject) {
  try {
    const result = await mongoClient.db(mongoDB).collection('type').insertOne(jsonObject);
    console.log(`New listing created with the following id: ${result.insertedId}`);
  } catch (e) {
    console.log('MongoDB Error - while creating a listing: ', e);
  }
}

async function createEngagement(jsonObject) {
  try {
    const result = await mongoClient.db(mongoDB).collection('engagement-details').insertOne(jsonObject);
    console.log(`New listing created with the following id: ${result.insertedId}`);
  } catch (e) {
    console.log('MongoDB Error - while creating a listing: ', e);
  }
}

async function updateEngagementByRoomId(roomId, columnName, engagementType = '') {
  try {
    if (columnName == 'status') {
      await mongoClient
        .db(mongoDB)
        .collection('engagement-details')
        .updateOne({ room_id: roomId }, { $set: { status: 'Deprecated' } });
      console.log(`Status is updated.`);
    } else if (columnName == 'engagement_type') {
      await mongoClient
        .db(mongoDB)
        .collection('engagement-details')
        .updateOne({ room_id: roomId }, { $set: { engagement_type: engagementType } });
      console.log(`Engagement Type is updated.`);
    }
  } catch (e) {
    console.log('MongoDB Error - while updating engagement details: ', e);
  }
}

async function createReminder(jsonObject) {
  try {
    const result = await mongoClient.db(mongoDB).collection('task-reminders').insertOne(jsonObject);
    console.log(`New reminder created with the following id: ${result.insertedId}`);
  } catch (e) {
    console.log('MongoDB Error - while creating a reminder: ', e);
  }
}

async function deleteListingByName(nameOfListing) {
  try {
    const result = await mongoClient.db(mongoDB).collection('type').deleteOne({ type: nameOfListing });
    console.log(`${result.deletedCount} document(s) was/were deleted.`);
  } catch (e) {
    console.log('MongoDB Error - while deleting a listing: ', e);
  }
}

async function deleteReminder(id) {
  try {
    const result = await mongoClient.db(mongoDB).collection('task-reminders').deleteOne({ _id: id });
    console.log(`${result.deletedCount} document(s) was/were deleted.`);
  } catch (e) {
    console.log('MongoDB Error - while deleting a reminder: ', e);
  }
}

async function updateListingByName(nameOfListing, peopleArray) {
  try {
    await mongoClient
      .db(mongoDB)
      .collection('type')
      .updateOne({ type: nameOfListing }, { $push: { people: { $each: peopleArray } } });
    console.log(`Document(s) was/were updated.`);
  } catch (e) {
    console.log('MongoDB Error - while updating people: ', e);
  }
}

async function updateListingName(nameOfListing, rename) {
  try {
    await mongoClient
      .db(mongoDB)
      .collection('type')
      .updateOne({ type: nameOfListing }, { $set: { type: rename } });
    console.log(`Document(s) was/were updated.`);
  } catch (e) {
    console.log('MongoDB Error - while updating engagement type name: ', e);
  }
}

async function updateListingNotes(nameOfListing, note1, note2) {
  try {
    await mongoClient
      .db(mongoDB)
      .collection('type')
      .updateMany({ type: nameOfListing }, { $set: { note1: note1, note2: note2 } });
    console.log(`Document(s) was/were updated.`);
  } catch (e) {
    console.log('MongoDB Error - while updating notes: ', e);
  }
}

async function updateListingLinks(nameOfListing, peopleArray) {
  try {
    await mongoClient
      .db(mongoDB)
      .collection('type')
      .updateOne({ type: nameOfListing }, { $push: { links: { $each: peopleArray } } });
    console.log(`Document(s) was/were updated.`);
  } catch (e) {
    console.log('MongoDB Error - while updating links: ', e);
  }
}

async function removeArrayElement(nameOfListing, emailArray) {
  try {
    emailArray.forEach(async (email) => {
      await mongoClient
        .db(mongoDB)
        .collection('type')
        .updateOne({ type: nameOfListing }, { $pull: { people: { email: email } } });
    });
    console.log(`Document(s) was/were updated.`);
  } catch (e) {
    console.log('MongoDB Error - while removing people: ', e);
  }
}
async function removeLinks(nameOfListing, LinksArray) {
  try {
    LinksArray.forEach(async (link) => {
      await mongoClient
        .db(mongoDB)
        .collection('type')
        .updateOne({ type: nameOfListing }, { $pull: { links: { $eq: link } } });
    });
    console.log(`Document(s) was/were updated.`);
  } catch (e) {
    console.log('MongoDB Error - while removing links: ', e);
  }
}

async function getDetailsByEngagementType(engagementType) {
  let cursor = await mongoClient
    .db(mongoDB)
    .collection(typeCol)
    .aggregate([{ $match: { type: engagementType } }]);
  return cursor;
}

/* EXPORTS */

export {
  mongoClient,
  mongoDB,
  typeCol,
  createListing,
  createEngagement,
  updateEngagementByRoomId,
  deleteListingByName,
  updateListingByName,
  removeArrayElement,
  updateListingLinks,
  removeLinks,
  updateListingName,
  updateListingNotes,
  createReminder,
  deleteReminder,
  getDetailsByEngagementType
};
