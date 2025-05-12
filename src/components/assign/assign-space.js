import { config } from 'dotenv';
config();
import { getJiraUUID } from './get-jira-uuid.js';
import { sendWebexMessage } from '../general/messages.js';
import { webex } from '../main.js';
import { getRoomDetails } from '../general/get-room-details.js';
import assignCard from '../../cards/assignCard.json' assert { type: 'json' };
import handleResponse from '../../utils/handle-response.js';
import { createWebexMembership, updateWebexMembership, listWebexMemberships } from '../general/memberships.js';
import { getEmail } from '../general/get-person-details.js';
import { getCustomFields, getUsers } from './get-jira-values.js';

async function jiraAssign(name, quarter, roomId, comments, opportunityLink) {
  var description = comments + '\nOpportunity link: ' + opportunityLink;
  Promise.all([getJiraUUID(name), getEmail(name), getRoomDetails(roomId)])
    .then(([id, personEmail, roomDetails]) =>
      listWebexMemberships({ roomId: roomId })
        .then((memberships) => memberships.items.find((e) => e?.personEmail === personEmail))
        .then((membership) => {
          if (membership == null) {
            return createWebexMembership({ roomId, personEmail }).then((member) => updateWebexMembership(member));
          } else if (membership?.isModerator === false) {
            return updateWebexMembership(membership);
          }
        })
        .then(() => {
          const bodyData = {
            fields: {
              project: {
                key: 'FER'
              },
              summary: roomDetails.title,
              assignee: {
                id
              },
              reporter: {
                id
              },
              issuetype: {
                name: 'Task'
              },
              description: {
                version: 1,
                type: 'doc',
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: description
                      }
                    ]
                  }
                ]
              },
              customfield_10034: {
                value: quarter
              },
              customfield_10015: new Date().toISOString().slice(0, 10)
            }
          };
          console.log('request body', bodyData);
          //Create Jira Issue
          fetch(process.env.JIRA_API_URL + '/issue', {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${Buffer.from(
                `${process.env.JIRA_EMAIL}:${process.env.JIRA_ACCESS_TOKEN}`
              ).toString('base64')}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyData)
          })
            .then((r) => handleResponse(r))
            .then((r) => r.json())
            .then((r) => {
              console.log(r);
              return jiraStatusChange(r.key, 31); //31 is for In Progress status
            })
            .catch((e) => console.log(e));
        })
    )
    .catch((e) => console.log(e));
}

function jiraStatusChange(key, statusNumber) {
  const body = {
    transition: {
      id: statusNumber
    }
  };
  //set status for jira issue
  fetch(process.env.JIRA_API_URL + '/issue/' + key + '/transitions', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_ACCESS_TOKEN}`).toString(
        'base64'
      )}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
    .then((r) => handleResponse(r))
    .catch(async (e) => console.log(await e));
}

function assignSpace(roomId, personEmail) {
  webex.memberships
    .list({ roomId: roomId })
    .then(async function (memberships) {
      for (var membership of memberships) {
        if (membership.personEmail === personEmail) {
          if (membership.isModerator === true) {
            //send assign card
            console.log('Sending assign card.');
            let members = [];
            let quarters = [];
            await getUsers().then((r) => {
              r.forEach((user) => {
                members.push({ title: user.displayName, value: user.displayName });
              });
            });
            await getCustomFields().then((field) => {
              for (let value of field.allowedValues) {
                quarters.push({ title: value.value, value: value.value });
              }
            });
            console.log('members:');
            console.log(members);
            console.log('quarters:');
            console.log(quarters);
            assignCard.body[2].choices = members;
            assignCard.body[2].value = members[0]['value'];
            assignCard.body[4].choices = quarters;
            assignCard.body[4].value = quarters[0]['value'];
            sendWebexMessage(roomId, 'Lead Assign Request - Adaptive Card', assignCard);
            console.log('sent assign card.');
            break;
          } else {
            sendWebexMessage(roomId, `Only **moderators** can perform this action`);
            break;
          }
        } else {
          continue;
        }
      }
    })
    .catch((e) => console.error('In assign space', e));
}
export { assignSpace, jiraAssign };
