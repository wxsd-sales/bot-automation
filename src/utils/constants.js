//Card Constants
export const TITLE = 'Engagement Bot Configuration';

//Remove Add Messages
export const REMOVE_CONFIRMATION_MSG = 'Are you sure you want to remove ';
export const ADD_CONFIRMATION_MSG = 'Are you sure you want to add ';

//Main Change Card
export const MAIN_CARD_STATEMENT = 'Click one of the option to configure your engagement type';
export const ADD_ICON_URL =
  'https://cdn.glitch.global/9d61d6d3-fe2d-454a-8661-2a5ac9778baa/add_icon.png?v=1684533241968';
export const MODIFY_ICON_URL =
  'https://cdn.glitch.global/9d61d6d3-fe2d-454a-8661-2a5ac9778baa/edit_icon.png?v=1684533717947';
export const REMOVE_ICON_URL =
  'https://cdn.glitch.global/9d61d6d3-fe2d-454a-8661-2a5ac9778baa/remove_icon.png?v=1684533205927';

//Modify Main Card
export const MODIFY_MAIN_TITLE = 'Modify Engagement Type';
export const MODIFY_MAIN_OPTION_1 = 'Modify Members';
export const MODIFY_MAIN_OPTION_2 = 'Modify Links';
export const MODIFY_MAIN_OPTION_3 = 'Modify Other Engagement Details';

//Modify Members Main card
export const MODIFY_MEM_MAIN_TITLE = 'Modify Membership to an Engagement Type';
export const MODIFY_MEM_MAIN_LABEL = 'Select your activity:';
export const MODIFY_MEM_MAIN_OPTION_1 = 'Add default responders to an existing engagement';
export const MODIFY_MEM_MAIN_OPTION_2 = 'Remove default responders from an existing engagement';
export const MODIFY_MEM_MAIN_OPTION_3 = 'Change moderation for existing responders';

//Modify Links Main card
export const MODIFY_LINKS_MAIN_TITLE = 'Modify Links of an Engagement Type';
export const MODIFY_LINKS_MAIN_LABEL = 'Select your activity:';
export const MODIFY_LINKS_MAIN_OPTION_1 = 'Add new links to an existing engagement';
export const MODIFY_LINKS_MAIN_OPTION_2 = 'Remove existing links from an existing engagement';

//Modify Other team details
export const MODIFY_TEAM_DETAILS_MAIN_TITLE = 'Modify other details of an Engagement Type';
export const MODIFY_TEAM_DETAILS_MAIN_LABEL = 'Select your activity:';
export const MODIFY_TEAM_DETAILS_MAIN_OPTION_1 = 'Change title for an existing engagement type';
export const MODIFY_TEAM_DETAILS_MAIN_OPTION_2 = 'Change notes for an existing engagement type';

//Redirect Card Constants
export const NO_ADDITIONAL_RESPONDERS = 'No Additional Responders';
export const NO_ADDITIONAL_RESP_MSG =
  'Oops!! There are no additional responders in the team who can be added to the engagement type.';
export const NO_WEBEX_TEAM = 'No Additional Responders';
export const NO_WEBEX_TEAM_MSG =
  "Oops!! You don't have any Webex team associated with your bot accounr. Please create a new Webex team.";
export const NO_TEAM_MEMBERSHIPS = 'No Team Memberships';
export const NO_TEAM_MEMBERSHIPS_MSG =
  "Oops!! Your Webex team doesn't have any members in it. Please add some members.";
export const NO_RESPONDERS = 'No Responders';
export const NO_RESP_MSG = 'Oops!! There are no responders in the engagement type.';
export const NO_MODERATORS = 'No Moderators';
export const NO_MODERATORS_MSG = 'Oops!! There are no moderators to remove.';
export const NO_NON_MODERATORS = 'No Non-Moderators';
export const NO_NON_MODERATORS_MSG = 'Oops!! There are no responders or all responders are moderators';
export const NO_ADDITIONAL_LINKS = 'No Additional Links';
export const NO_ADDITIONAL_LINKS_MSG = 'Oops!! There are no additional links that can be added to this engagement';
export const NO_LINKS_TO_REMOVE = 'No Links to Remove';
export const NO_LINKS_TO_REMOVE_MSG = 'Oops!! There are no links that can be removed from this engagement';

export const REDIRECT_MSG = 'After adding send HELP message to the bot to restart.';

//Add Team Card
export const ADD_TEAM_TITLE = 'Add Engagement Type';

//Add Team First Card

export const TEAM_NAME_LABEL = 'Enter engagement type name:';
export const TEAM_NAME_PLACEHOLDER = 'Engagement Type Name';
export const TEAM_NAME_ERROR_MESSAGE = 'Engagement type is required';
export const TEAM_ID_LABEL = 'Select Team:';
export const TEAM_ID_ERROR_MESSAGE = 'Team is required';
export const SHORT_NAME_LABEL = 'Enter short name for the engagement type:';
export const SHORT_NAME_ERROR_MESSAGE = 'Short name for the engagement type is required';
export const NOTE_1_LABEL = 'Enter Note 1:';
export const NOTE_1_VALUE =
  'It is extremely important that all meetings with respect to this engagement, are scheduled through this space.';
export const NOTE_2_LABEL = 'Enter Note 2:';
export const NOTE_2_VALUE =
  'Please feel free to explore the links below.  An expert will follow up with you as soon as possible.';
export const FIRST_CARD_FACTS = [
  {
    title: 'Engagement Type Name',
    value:
      'Name of the new engagement type to be added to the card. ex:- API/SDK Proof of Concept Integration Development'
  },
  {
    title: 'Team',
    value: 'Select a Webex team, in which the spaces related to this engagement type will be created'
  },
  {
    title: 'Short Name',
    value: 'Add a short name for the engagement type ex:- PoC, Calling etc'
  },
  {
    title: 'Note 1 and Note 2',
    value:
      'These are the notes displayed in the space for the sales specialist. Please try to keep it similar to the default message.'
  }
];

//Add Team Second Card

export const DEFAULT_RESP_LABEL = 'Select default responders:';
export const DEAFULT_RESP_ERROR_MESSAGE = 'Please select atleast one responder';
export const DEFAULT_RESP_DEF =
  'Default responders are added automatically to the space created, once a sales specialist requests for assistance. ';

//Add Team Third Card

export const DEFAULT_MOD_LABEL = 'Select default moderators:';
export const DEFAULT_MOD_ERROR_MESSAGE = 'Please select atleast one moderator';
export const DEFAULT_MOD_DEF =
  'Default moderators are some of the responders who are automatically made moderators to the space created. You need to select atleast one moderator. ';

//Add Team Fourth Card

export const LINKS_LABEL = 'Select Links:';
export const LINKS_DEF =
  'These are the links that will be shown in the space created. They help the sales specialist go through basic documentation they might need before the responder takes up the engagement.';

//Remove Team Card

export const REMOVE_TEAM_TITLE = 'Remove Engagement Type';

//Remove Team First Card
export const REMOVE_TEAM_LABEL = 'Select engagement type to be removed:';
export const REMOVE_TEAM_ERROR_MESSAGE = 'Please select engagement type';

//Add Members Card
export const ADD_MEMBERS_TITLE = 'Add Responders to Engagement Type';

//Add Members First Card
export const ADD_MEM_TEAM_LABEL = 'Select engagement type to which you want to add default responders:';
export const ADD_MEM_TEAM_ERROR_MESSAGE = 'Please select engagement type';

//Add Members Second Card
export const ADD_MEM_RESP_LABEL = 'Select default responders to be added to the engagement type:';
export const ADD_MEM_RESP_ERROR_MESSAGE = 'Please select atleast one responder';

//Add Members Third Card
export const ADD_MEM_MOD_LABEL = 'Select default moderators to be added to the engagament type:';
export const ADD_MEM_MOD_ERROR_MESSAGE = 'Please select atleast one moderator';

//Remove Members Card
export const REMOVE_MEMBERS_TITLE = 'Remove Default Responders';

//Remove members first card
export const REMOVE_MEM_TEAM_LABEL = 'Select engagement type to which you want to remove default responders:';
export const REMOVE_MEM_TEAM_ERROR_MESSAGE = 'Please select engagement type';

//Remove members second card
export const REMOVE_MEM_RESP_LABEL = 'Select default responders to be removed from the engagement type:';
export const REMOVE_MEM_RESP_ERROR_MESSAGE = 'Please select atleast one responder';

//Change Mod Cards
export const CHANGE_MOD_TITLE = 'Change Moderation';

//Change Mod First card
export const CHNAGE_MOD_TEAM_LABEL = 'Select engagement type:';
export const CHANGE_MOD_TEAM_ERROR_MESSAGE = 'Please select engagement type';

//Change Mod Second card
export const CHNAGE_MOD_ACTIVITY_LABEL = 'Select moderation type:';
export const CHANGE_MOD_ACTIVITY_ERROR_MESSAGE = 'Please select moderation type';

//Add Mod card
export const ADD_MOD_LABEL = 'Select default moderators to be added to the engagement type:';
export const ADD_MOD_ERROR_MESSAGE = 'Please select atleast one moderator';

//Remove Mod card
export const REMOVE_MOD_LABEL = 'Select default moderators to be removed from the engagement type:';
export const REMOVE_MOD_ERROR_MESSAGE = 'Please select atleast one moderator';

//Add Links Card
export const ADD_LINKS_TITLE = 'Add Links to Engagement Type';

//Add Links First Card
export const ADD_LINKS_TEAM_LABEL = 'Select engagement type to which you want to add links:';
export const ADD_LINKS_TEAM_ERROR_MESSAGE = 'Please select engagement type';

//Add Links Second card
export const ADD_LINKS_LABEL = 'Select links to be added to the engagement type:';
export const ADD_LINKS_ERROR_MESSAGE = 'Please select atleast one link';

//Remove Links Card
export const REMOVE_LINKS_TITLE = 'Remove Links from Engagement Type';

//Remove Links First Card
export const REMOVE_LINKS_TEAM_LABEL = 'Select engagement type to which you want to remove links:';
export const REMOVE_LINKS_TEAM_ERROR_MESSAGE = 'Please select engagement type';

//Remove Links Second card
export const REMOVE_LINKS_LABEL = 'Select links to be removed from the engagement type:';
export const REMOVE_LINKS_ERROR_MESSAGE = 'Please select atleast one link';

//Modify Team Name Card
export const MODIFY_TEAM_NAME_TITLE = 'Change Title of an Engagement Type';

//Modify Team Name First Card
export const MODIFY_TEAM_NAME_LABEL = 'Select engagement type to which you want to change title:';
export const MODIFY_TEAM_NAME_ERROR_MESSAGE = 'Please select engagement type';

//Modify Team Name Second Card
export const RENAME_TEAM_LABEL = 'Rename the engagement type to:';
export const RENAME_TEAM_ERROR_MESSAGE = 'Please enter the name';

//Modify Notes Card
export const MODIFY_NOTES_TITLE = 'Modify Notes in an Engagement Type';

//Modify Notes First Card
export const MODIFY_NOTES_LABEL = 'Select engagement type to which you want to modify notes:';
export const MODIFY_NOTES_ERROR_MESSAGE = 'Please select engagement type';

//Modify Notes Second Card
export const ENTER_NOTES_ERROR_MESSAGE = 'Please enter the notes';
