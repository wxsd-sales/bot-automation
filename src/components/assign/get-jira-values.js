import handleResponse from '../../utils/handle-response.js';

async function getCustomFields() {
  return await fetch(`${process.env.JIRA_API_URL}/issue/FER-1/editmeta`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_ACCESS_TOKEN}`).toString(
        'base64'
      )}`,
      Accept: 'application/json'
    }
  })
    .then((r) => handleResponse(r))
    .then((r) => r.json())
    .then((r) => r.fields.customfield_10034)
    .catch(async (e) => console.log(await e));
}
async function getUsers() {
  return await fetch(`${process.env.JIRA_API_URL}/users`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_ACCESS_TOKEN}`).toString(
        'base64'
      )}`,
      Accept: 'application/json'
    }
  })
    .then((r) => handleResponse(r))
    .then((r) => r.json())
    .then((r) => {
      let users = [];
      console.log('jira users', r);
      r.forEach((user) => {
        if (user.accountType == 'atlassian' && user.active == true) {
          users.push(user);
        }
      });
      return users;
    })
    .catch(async (e) => console.log(await e));
}

export { getCustomFields, getUsers };
