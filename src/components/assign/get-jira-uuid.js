import handleResponse from '../../utils/handle-response.js';

function getJiraUUID(name) {
  return fetch(`${process.env.JIRA_API_URL}/user/search?query=${name}`, {
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
    .then((r) => r[0].accountId)
    .catch(async (e) => console.log(await e));
}

export { getJiraUUID };
