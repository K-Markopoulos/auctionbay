import jwt = require('jsonwebtoken');
 
const subject = {
  AUTHENTICATION: 'AUTHENTICATION',
  PASSWORD_RESET: 'PASSWORD_RESET'
};

// Generates a token for the given payload using the given secret.
const generate = (payload: any, secret?: string, options?: any) => {
  return jwt.sign(payload, secret || process.env.SECRET_KEY, options);
};

// Verifies the given token using the given secret, and returns the original payload.
const verify = (token: string, secret?: string, options?: any) => {
  return jwt.verify(token, secret || process.env.SECRET_KEY, options);
};

// Decodes the given token without verifying it, and returns the original payload.
const decode = (token: string, options?: any) => {
  return jwt.decode(token, options);
};

export = {
  decode,
  generate,
  verify,
  subject
};
