// Empty LOCAL = relative paths → Vite proxy forwards /api/* to http://localhost:8000
const LOCAL = "";

export const Config = {
  baseUrl: `${LOCAL}/api/users`,
  SignUPUrl: `${LOCAL}/api/users/signup`,
  LOGINUrl: `${LOCAL}/api/users/login`,
  GoogleClientId: "748627875694-hqpvo0akdcvtgjpvqluoap2dm3bafbia.apps.googleusercontent.com",
  GoogleSignUpUrl: `${LOCAL}/api/users/googleLogin`,
  LogoutUrl: `${LOCAL}/api/users/logout`,
  ContactUrl: `${LOCAL}/api/contacts/addcontact`,
  GETDATAUrl: `${LOCAL}/api/users/get-data`,
  CHECKAuthUrl: `${LOCAL}/api/users/auth-check`,
  DELETECONTACTUrl: `${LOCAL}/api/contacts/delete-contact`,
  EMERGENCYUrl: `${LOCAL}/api/contacts/emergency`,
  ADDREVIEWUrl: `${LOCAL}/api/reviews/addreview`,
  GETREVIEWSUrl: `${LOCAL}/api/reviews/allreviews`,
  ADDPROFILEPHOTO: `${LOCAL}/api/profile/add-photo`,
  UPDATEUSERNAME: `${LOCAL}/api/profile/update-name`,
  UPDATEEMAIL: `${LOCAL}/api/profile/update-email`,
  UPDATEPASSWORD: `${LOCAL}/api/profile/update-password`,
  GUIDANCEUrl:    `${LOCAL}/api/guidance/guide`,
  STATIONSUrl:    `${LOCAL}/api/guidance/stations`,
}