import { webex } from '../main.js';
import assert from 'assert';

function createWebexMembership(payload) {
  return webex.memberships.create(payload).catch(function (reason) {
    console.log(`create membership failed: ${reason}`);
  });
}
function updateWebexMembership(membership) {
  if (!membership.isModerator) {
    membership.isModerator = true;
    // console.log("MEMBERSHIP AFTER UPDATE")
    console.log('membership in update', membership);
    return webex.memberships.update(membership).catch(function (reason) {
      console.log(`update membership failed: ${reason}`);
    });
  }
}

function listWebexMemberships(membership) {
  return webex.memberships.list(membership).catch(function (reason) {
    console.log(`list membership failed: ${reason}`);
  });
}

export { createWebexMembership, updateWebexMembership, listWebexMemberships };
