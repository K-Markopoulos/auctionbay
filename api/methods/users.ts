import User, { IUser }from '../models/user';
import errors = require('../common/errors');
import bcrypt = require('bcrypt');
import tokens = require('../common/tokens');
import enums = require('../models/enums');
import Files = require('../common/files');

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

const _validateNewEmail = async (input: any): Promise<void> => {
  const sameEmailUser = await User.findOne({ _id: { $ne: input.accessor._id }, email: input.email });
  if (sameEmailUser) {
    throw new errors.BadRequestError('EMAIL_ALREADY_EXISTS');
  }
};

const _addAvatar = async (input: any) => {
  if (!input.file) {
    return;
  }
  const files = await Promise.all(Files.move([input.file], process.env.UPLOAD_FILE_PATH));
  return files[0];
};


const _getQueryFilters = (input: any) => {
  const filters = {};
  if (input.search) {
    filters['$text']  = {$search: input.search}
  }
  if (input.status) {
    filters['status'] = input.status;
  }
  return filters;
};

const sortByAvailableFields = {
  username: 'username',
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  "location.address": 'location.address',
  "location.country" : 'location.country',
  status: 'status',
  createdAt: 'createdAt',
};

const _getQueryOptions = (input: any) => {
  const page = Number(input.page) || 0;
  const limit = Number(input.limit) || 0;
  const sortBy = sortByAvailableFields[input.sortBy] || 'createdAt';
  const order = input.order === 'desc' ? -1 : 1;

  return {
    skip: page * limit,
    limit: limit,
    sort: {
      [sortBy]: order
    }
  }
};

const getAllUsers = async (input) => {
  const filters = _getQueryFilters(input);
  const options = _getQueryOptions(input);
  console.log(filters);
  console.log(options);
  const users = await User.find(filters, {}, options);
  const usersCount = await User.countDocuments(filters);
  return {
    data: users.map((user: IUser) => user.toJSON()),
    total: usersCount
  }
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
    taxId: input.taxId,
    avatar: null
  };
  Object.keys(changes).forEach(x => {
    if (!changes[x]) {
      delete changes[x];
    }
  });
  if (changes.email) {
    await _validateNewEmail(input);
  }
  console.log(input);
  const avatar = await _addAvatar(input);
  if (avatar) {
    changes.avatar = avatar;
  }
  console.log('Avatar', avatar);
  const user = await User.findByIdAndUpdate(input.id, changes, { new: true });
  console.info('Updated user ', user.username);
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
      ...u.toJSON(),
      token
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