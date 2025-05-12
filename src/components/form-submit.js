import { mongoClient, mongoDB, typeCol, createEngagement } from '../utils/db.js';
import { webex } from './main.js';
import { sendWebexMessage, sendIntroSpaceMessage, sendMainCard } from './general/messages.js';
import { createWebexMembership, updateWebexMembership } from './general/memberships.js';
import { config } from 'dotenv';
config();

async function formSubmitted(actorId, inputs, roomId) {
  sendWebexMessage(
    roomId,
    'Thank you for your submission. Your request for creating a new engagement is under process.'
  );
  console.log('formSubmitted');
  console.log(inputs);
  try {
    let cursor = await mongoClient
      .db(mongoDB)
      .collection(typeCol)
      .aggregate([
        { $match: { type: inputs.engagement_type } },
        {
          $lookup: {
            from: 'links',
            localField: 'links',
            foreignField: '_id',
            as: 'links'
          }
        }
      ]);
    let doc;
    if (await cursor.hasNext()) {
      doc = await cursor.next();
      console.log('doc:');
      console.log(doc);
      let roomPayload = {
        title: `COE Engagement: ${inputs.customer_name} ($${inputs.tcv_value}) - ${doc.short_name}`
      };
      if ([null, undefined, ''].indexOf(doc.team_id) < 0) {
        roomPayload['teamId'] = doc.team_id;
      }
      webex.rooms
        .create(roomPayload)
        .then(async function (room) {
          console.log('Engagement Type:', room);
          console.log('LINE 248');
          let memberships = await webex.memberships.list({ roomId: room.id });
          console.log('memberships', memberships);
          let botsMembership = memberships.items[0];
          //updating current rooms bot membership
          await updateWebexMembership(botsMembership);
          let isCreated = false;
          let actorMembership;
          for (let pers of doc.people) {
            await createWebexMembership({
              roomId: room.id,
              personEmail: pers.email
            }).then(async (membership) => {
              //console.log(membership);
              if (membership.personId == actorId) {
                isCreated = true;
                actorMembership = membership;
              }
              if (pers.isModerator === true) {
                await updateWebexMembership(membership);
              }
            });
          }
          if (!isCreated) {
            actorMembership = await createWebexMembership({
              roomId: room.id,
              personId: actorId
            });
          }

          if (actorMembership?.personEmail != null) {
            let jsonObject = {
              customer_name: inputs.customer_name,
              submitted_by: actorMembership.personEmail,
              date_submitted: new Date().toISOString().split('T')[0],
              status: 'New',
              room_id: room.id,
              opportunity_link: inputs.opportunity_link,
              engagement_type: inputs.engagement_type,
              geography: inputs.geography,
              sales_level_2: inputs.sales_level_2,
              sales_level_3: inputs.sales_level_3,
              comments: inputs.comments
            };
            createEngagement(jsonObject);
          }

          await sendIntroSpaceMessage(room.id, actorId, inputs, doc.links, doc.note1, doc.note2);

          var decodedRoomId = atob(room.id);
          const lastSlashIndex = decodedRoomId.lastIndexOf('/');

          // Extract the part after the last slash
          const result = decodedRoomId.substring(lastSlashIndex + 1);
          var newDecodedRoomId = 'webexteams://im?space=' + result;
          sendWebexMessage(roomId, `A new space to discuss your request is created. ${newDecodedRoomId}`);
        })
        .catch(function (error) {
          let msg = `formSubmitted Error: failed to create room: ${error}`;
          console.log(msg);
          console.log(roomPayload);
          sendWebexMessage(process.env.ERROR_ROOM_ID, msg);
        });
      // sendWebexMessage(
      //   roomId,
      //   'Thank you for your submission. A new space to discuss your request is being created now.'
      // );
    } else {
      let msg = "formSubmitted Error: mongo aggregate couldn't find an item of type **" + inputs.engagement_type + '**';
      console.log(msg);
      sendWebexMessage(process.env.ERROR_ROOM_ID, msg);
      sendWebexMessage(roomId, msg + '\n Please resubmit the form!');
      sendMainCard(roomId);
    }
  } catch (e) {
    console.log('Error in formSubmitted: ', e);
  }
}

export { formSubmitted };
