const TOKEN_KEY = 'access_token';
const USER_ID_KEY = 'user_id';

const TokenService = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUserID() {
    return localStorage.getItem(USER_ID_KEY);
  },

  saveToken(accessToken) {
    localStorage.setItem(TOKEN_KEY, accessToken);
  },

  saveUserID(userID) {
    localStorage.setItem(USER_ID_KEY, userID);
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  removeUserID() {
    localStorage.removeItem(USER_ID_KEY);
  }
};

export default TokenService;