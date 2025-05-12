import handleResponse from '../../utils/handle-response.js';

function getTeamMemberships(teamId) {
  return fetch(process.env.WEBEX_API_URL + '/team/memberships?teamId=' + teamId, {
    headers: {
      'Authorization': 'Bearer ' + process.env.WEBEX_ACCESS_TOKEN,
      'Content-Type': 'application/json'
    },
    method: 'GET'
  })
    .then((r) => handleResponse(r))
    .then((r) => r.json())
    .catch((e) => console.log(e));
}

function getTeams() {
  return fetch(process.env.WEBEX_API_URL + '/teams', {
    headers: {
      'Authorization': 'Bearer ' + process.env.WEBEX_ACCESS_TOKEN,
      'Content-Type': 'application/json'
    },
    method: 'GET'
  })
    .then((r) => handleResponse(r))
    .then((r) => r.json())
    .catch((e) => console.log(e));
}

function getTeamDetails(teamId) {
  return fetch(process.env.WEBEX_API_URL + '/teams/' + teamId, {
    headers: {
      'Authorization': 'Bearer ' + process.env.WEBEX_ACCESS_TOKEN,
      'Content-Type': 'application/json'
    },
    method: 'GET'
  })
    .then((r) => handleResponse(r))
    .then((r) => r.json())
    .catch((e) => console.log(e));
}
export { getTeamMemberships, getTeams, getTeamDetails };
