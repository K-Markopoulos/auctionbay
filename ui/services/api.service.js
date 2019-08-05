import axios from 'axios'
import TokenService from './token.service'
import https from 'https'
import router from '../router'

axios.defaults.httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

axios.interceptors.response.use(
    response => response,
    error => {
        const {status} = error.response;
        if (status === 401) {
          TokenService.removeToken();
          router.push('login');
        }
        return Promise.reject(error);
   }
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

    post(resource, data) {
        return axios.post(resource, data)
    },

    put(resource, data) {
        return axios.put(resource, data)
    },

    delete(resource) {
        return axios.delete(resource)
    },
};

export default ApiService;