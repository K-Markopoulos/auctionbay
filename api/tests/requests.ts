import chai = require('chai');
import chaihttp = require('chai-http');
chai.use(chaihttp);
chai.should();

const get = (app: any, url: string, token?: string) => {
  const request = chai.request(app).get(url);
  if (token) {
    request.set('Authorization', `Bearer ${token}`);
  }
  return request;
};

const post = (app: any, url: string, data?: any, token?: string) => {
  const request = chai.request(app).post(url);
  if (token) {
    request.set('Authorization', `Bearer ${token}`);
  }
  return request.send(data);
};

const put = (app: any, url: string, data?: any, token?: string) => {
  const request = chai.request(app).put(url);
  if (token) {
    request.set('Authorization', `Bearer ${token}`);
  }
  return request.send(data);
};

export {
  get,
  post,
  put
}