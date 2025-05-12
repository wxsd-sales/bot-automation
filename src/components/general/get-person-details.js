import handleResponse from '../../utils/handle-response.js';

function getEmail(name) {
  return fetch(`${process.env.WEBEX_API_URL}/people?displayName=${name}`, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + process.env.WEBEX_ACCESS_TOKEN,
      'Content-Type': 'application/json'
    }
  })
    .then((r) => handleResponse(r))
    .then((r) => r.json())
    .then((r) => r.items[0].emails[0])
    .catch((e) => console.log(e));
}

function getName(email) {
  return fetch(`${process.env.WEBEX_API_URL}/people?email=${email}`, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + process.env.WEBEX_ACCESS_TOKEN,
      'Content-Type': 'application/json'
    }
  })
    .then((r) => handleResponse(r))
    .then((r) => r.json())
    .then((r) => r.items[0].displayName)
    .catch((e) => console.log(e));
}

export { getEmail, getName };
