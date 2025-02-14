import axios from 'axios'
import TokenService from './token.service'
import Errors from './errors.service'
import https from 'https'
import router from '../router'

axios.defaults.httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

axios.interceptors.response.use(
  response => response,
  Errors.handleResponse
);

const ApiService = {
  
  init(baseURL) {
    axios.defaults.baseURL = baseURL;
  },

  setHeader() {
    axios.defaults.headers.common["Authorization"] = `Bearer ${TokenService.getToken()}`
  },

  removeHeader() {
    axios.defaults.headers.common = {}
  },

  get(resource) {
    return axios.get(resource)
  },

  post(resource, data, multipart) {
    const config = multipart 
      ? {
          headers: {
            'content-type': 'multipart/form-data'
          }
        }
      : {};
    return axios.post(resource, data, config)
  },

  put(resource, data, multipart) {
    const config = multipart 
      ? {
          headers: {
            'content-type': 'multipart/form-data'
          }
        }
      : {};
    return axios.put(resource, data, config)
  },

  delete(resource) {
    return axios.delete(resource)
  },
};

export default ApiService;