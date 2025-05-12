import handleResponse from '../../utils/handle-response.js';

function getRoomDetails(roomId) {
  return fetch(process.env.WEBEX_API_URL + '/rooms/' + roomId, {
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
export { getRoomDetails };
