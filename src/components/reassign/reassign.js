import { webex } from '../main.js';
import { createWebexMembership, updateWebexMembership } from '../general/memberships.js';
import { sendWebexMessage } from '../general/messages.js';
import { mongoClient, mongoDB, typeCol, updateEngagementByRoomId } from '../../utils/db.js';
import reassignCard from '../../cards/reassign.json' assert { type: 'json' };
import handleResponse from '../../utils/handle-response.js';
import { getTeamDetails } from '../general/get-team-details.js';

async function reassignSpace(roomId, personEmail, personId) {
  await webex.memberships
    .list({ roomId: roomId })
    .then(async function (memberships) {
      for (let m of memberships) {
        if (m.personId == personId && m.isModerator == true) {
          var roomDetails = await webex.rooms.get(roomId);
          //const teamId = roomDetails.teamId;
          sendReassignCard(roomId, roomDetails);
        } else if (m.personId == personId && m.isModerator == false) {
          sendWebexMessage(roomId, `Only **moderators** can perform this action`);
        }
      }
    })
    .catch((e) => console.log('Error while reassigning space', e));
}

async function reassignSubmit(roomId, inputs) {
  sendWebexMessage(roomId, `Please wait while we process your reassign request`);
  var roomDetails = await webex.rooms.get(roomId);
  console.log('Reassign inputs', inputs);
  if (roomDetails.teamId != null) {
    const teamArray = atob(roomDetails.teamId).split('/');
    let decTeamId = teamArray[4];
    const convArray = atob(roomId).split('/');
    let decRoomId = convArray[4];
    const bodyData = {
      team_url: `${process.env.LOCUS_URL}/teams/${decTeamId}`,
      conv_url: `${process.env.LOCUS_URL}/conversations/${decRoomId}`
    };
    await fetch(`${process.env.ACCESS_INT_SDK_URL}/removeFromTeam`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.WEBEX_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyData)
    })
      .then((r) => handleResponse(r))
      .then(async () => {
        getTeamDetails(roomDetails.teamId).then((team) => {
          console.log('team', team);
          sendWebexMessage(roomId, `Space succesfully removed from **${team.name}** team`);
        });
        await addToTeam(roomId, inputs, roomDetails);
      })
      .catch(async (e) => {
        sendWebexMessage(roomId, `Failed to remove space from team. Please try again.`);
        console.log('Error while removing from team', await e);
      });
  } else {
    addToTeam(roomId, inputs, roomDetails);
  }
}

async function addToTeam(roomId, inputs, roomDetails) {
  let engagement_type;
  // remove all existing moderators
  await webex.memberships
    .list({ roomId: roomId })
    .then((memberships) => {
      console.log('memberships', memberships.items);
      for (let membership of memberships.items) {
        if (!membership.personEmail.includes('webex.bot') && membership.isModerator == true) {
          console.log('Removing Existing moderators');
          membership.isModerator = false;
          webex.memberships.update(membership).catch(function (reason) {
            console.log(`update membership failed: ${reason}`);
          });
        }
      }
    })
    .catch((e) => console.log('Error while listing memberships in reassign', e));
  const body = {
    title: roomDetails.title,
    teamId: inputs.engagement_type
  };
  //Update Room with new teamID
  mongoClient
    .db(mongoDB)
    .collection(typeCol)
    .find()
    .toArray(async function (err, documents) {
      console.log('REASSIGN UPDATE');
      for (let doc of documents) {
        if (doc.team_id == inputs.engagement_type) {
          let currentTitle = roomDetails.title;
          let shortName = doc.short_name;
          console.log('shortName', shortName, 'current title:', currentTitle);
          let updatedTitle = currentTitle.split(' - ')[0] + ' - ' + shortName;
          console.log('updatedTitle', updatedTitle);
          const body = {
            title: updatedTitle,
            teamId: inputs.engagement_type
          };
          await fetch(`${process.env.WEBEX_API_URL}/rooms/${roomId}`, {
            method: 'PUT',
            headers: {
              'Authorization': 'Bearer ' + process.env.WEBEX_ACCESS_TOKEN,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
          })
            .then((r) => handleResponse(r))
            .then(async () => {
              console.log('Adding space to a new team');
              getTeamDetails(inputs.engagement_type).then((team) => {
                console.log('team', team);
                sendWebexMessage(roomId, `Space succesfully added to **${team.name}** team`);
              });
              let currentMembers = await webex.memberships.list({ roomId: roomId });
              let emails = new Set();
              for (let currentMember of currentMembers.items) {
                emails.add(currentMember.personEmail);
              }
              engagement_type = doc.type;
              console.log('enagagement type', engagement_type);
              // update the engagement type in the db
              updateEngagementByRoomId(roomId, 'engagement_type', engagement_type);
              for (let people of doc.people) {
                //add new people to the space
                if (!emails.has(people.email)) {
                  createWebexMembership({
                    roomId: roomId,
                    personEmail: people.email
                  })
                    .then(async (membership) => {
                      emails.add(people.email);
                      if (people.isModerator == true) {
                        //console.log(membership);
                        await updateWebexMembership(membership);
                      }
                    })
                    .catch((err) => {
                      console.log(`create memberships failed: ${err}`);
                    });
                } else {
                  if (people.isModerator == true) {
                    for (let currentMember of currentMembers.items) {
                      if (currentMember.personEmail == people.email) {
                        await updateWebexMembership(currentMember);
                      }
                    }
                  }
                }
              }
            })
            .catch((e) => {
              sendWebexMessage(roomId, `Failed to add space to team. Please try again.`);
              console.log('Error while adding space to a new team', e);
            });
        }
      }
    });
}

function sendReassignCard(roomId, roomDetails) {
  try {
    let engagementTypes = [];
    mongoClient
      .db(mongoDB)
      .collection(typeCol)
      .find()
      .toArray(function (err, documents) {
        console.log('got engagementTypes');
        for (let doc of documents) {
          engagementTypes.push({
            title: doc.type,
            value: doc.team_id
          });
          engagementTypes = engagementTypes.filter((item) => item.value != roomDetails.teamId);
          console.log(engagementTypes);
        }
        reassignCard.body[2].choices = engagementTypes;
        reassignCard.body[2].value = engagementTypes[0]['teamId'];
        sendWebexMessage(roomId, 'Reassign - Engagement Request Form - Adaptive Card', reassignCard);
      });
  } catch (err) {
    console.log('In sendReassignCard' + err);
  }
}

export { reassignSpace, reassignSubmit };
