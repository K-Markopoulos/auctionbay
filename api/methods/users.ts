import User, { IUser }from '../models/user';
import errors = require('../common/errors');
import bcrypt = require('bcrypt');
import tokens = require('../common/tokens');

const _validate = async (user: IUser): Promise<IUser> => {
  const sameEmailUser = await User.findOne({ email: user.email });
  if (sameEmailUser) {
    throw new errors.BadRequestError('EMAIL_ALREADY_EXISTS');
  }
  const sameUsernamelUser = await User.findOne({ email: user.username });
  if (sameUsernamelUser) {
    throw new errors.BadRequestError('USERNAME_ALREADY_EXISTS');
  }
  return user;
};

const getAllUsers = async (input) => {
  const users = await User.find({});
  return users;
};

const createUser = async (input) => {
  const user = new User(input);
  return _validate(user).then((user: IUser) => {
    user.password = bcrypt.hashSync(input.password, 10);
    console.info('Created new user: ', user.username);
    return user.save();
  })
};

const getUser = async (input) => {

};

const updateUser = async (input) => {

};

const deleteUser = async (input) => {

};

const authenticateUser = async (input) => {
  const user = await User.findOne({
    email: input.email
  })

  if (!user) {
    throw new errors.UnauthorizedError();
  }
  
  const verified = await bcrypt.compare(input.password, user.password);
  if (!verified) {
    throw new errors.UnauthorizedError();
  }
  const token = await tokens.generate({ _id: user._id});
  user.lastLogin = new Date();
  return user.save().then((u: IUser) => {
    return {
      token,
      _id: u._id
    }
  });
};

const checkUsername = async (input) => {
  return User.findOne({ username: input.username }).then((user) => {
    return Boolean(user);
  })
};

const checkEmail = async (input) => {
  return User.findOne({ email: input.email }).then((user) => {
    return Boolean(user);
  })
};

export = {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  authenticateUser,
  checkUsername,
  checkEmail
}