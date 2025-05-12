import taskReminder from '../../cards/taskReminder.json' assert { type: 'json' };
import { sendWebexMessage } from '../general/messages.js';
import { createReminder } from '../../utils/db.js';
import { webex } from '../main.js';

async function taskRemind(roomId) {
  const today = new Date();
  const tomorrow = new Date(today);
  let members = [];
  members.push({
    title: 'All',
    value: 'all'
  });
  tomorrow.setDate(today.getDate() + 1);

  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0'); // Adding 1 as January is 0-indexed
  const day = String(tomorrow.getDate()).padStart(2, '0');

  const formattedTomorrow = `${year}-${month}-${day}`;
  console.log(formattedTomorrow);
  webex.memberships
    .list({ roomId: roomId })
    .then(async function (memberships) {
      for (var i = 0; i < memberships.length; i += 1) {
        if (!memberships.items[i].personEmail.includes('@webex.bot')) {
          console.log(memberships.items[i]);
          members.push({
            title: memberships.items[i].personDisplayName,
            value: memberships.items[i].personEmail
          });
        }
      }
      console.log(members);
      taskReminder.body[6].choices = members;
      taskReminder.body[6].value = members[0]['value'];
      taskReminder.body[4].min = formattedTomorrow;
      sendWebexMessage(roomId, 'Task Reminder - Engagement Request Form - Adaptive Card', taskReminder);
    })
    .catch((e) => {
      sendWebexMessage(roomId, `Error while listing memberships: ${e}`);
      console.log('Error while listing memberships: ', e);
    });
}

async function reminder(roomId, inputs, personEmail) {
  var listing = {
    roomId: roomId,
    title: inputs.title,
    date: inputs.date,
    createdBy: personEmail,
    reminderTo: inputs.member
  };
  await createReminder(listing);
  sendWebexMessage(
    roomId,
    `**Reminder Set:** The reminder for "${inputs.title}", will be sent to this space on ${inputs.date}`
  );
}

export { taskRemind, reminder };
