import User, { IUser }from '../models/user';
import errors = require('../common/errors');
import bcrypt = require('bcrypt');
import tokens = require('../common/tokens');
import enums = require('../models/enums');

const _validate = async (user: IUser): Promise<IUser> => {
  const sameEmailUser = await User.findOne({ email: user.email });
  if (sameEmailUser) {
    throw new errors.BadRequestError('EMAIL_ALREADY_EXISTS');
  }
  const sameUsernamelUser = await User.findOne({ username: user.username });
  if (sameUsernamelUser) {
    throw new errors.BadRequestError('USERNAME_ALREADY_EXISTS');
  }
  return user;
};

const getAllUsers = async (input) => {
  const users = await User.find({});
  return users.map((user: IUser) => user.toJSON());
};

const createUser = async (input) => {
  const user = await _validate(new User(input));
  user.password = bcrypt.hashSync(input.password, 10);
  console.info('Created new user: ', user.username);
  return (await user.save()).toJSON();
};

const getUser = async (input) => {
  const user = await User.findById(input.id);
  return user.toJSON();
};

const updateUser = async (input) => {
  const changes = {
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    location: input.location,
    phoneNumber: input.phoneNumber,
    taxId: input.taxId
  };
  Object.keys(changes).forEach(x => {
    if (!changes[x]) {
      delete changes[x];
    }
  });
  const user = await User.findByIdAndUpdate(input.id, changes, { new: true });
  return user.toJSON();
};

const approveUsers = async (input) => {
  const res = await User.updateMany(
    { _id: { $in: input.users }},
    { status: enums.Status.APPROVED },
    { multi: true }
  );
  return res;
};

const deleteUser = async (input) => {
  const user = await User.findByIdAndRemove(input.id);
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
  approveUsers,
  updateUser,
  deleteUser,
  authenticateUser,
  checkUsername,
  checkEmail
}