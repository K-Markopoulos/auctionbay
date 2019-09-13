import Message, { IMessage } from "../models/message"
import User, { IUser, SellerSummary } from "../models/user";
import enums = require("../models/enums");
import WS = require("../common/ws-server");

const create = async (details: any) => {
  const message = new Message(details);
  await message.save();
  return Message.populate(message, { path: 'from', select: '_id username', model: 'User'});
};

const send = async (message: IMessage) => {
  await User.findByIdAndUpdate(message.to, {
    $push: {
      messages: message._id
    }
  });
  if (message.from) {
    const from = (message.from as IUser)._id;
    await User.findByIdAndUpdate(from, {
      $push: {
        messages: message._id
      }
    });
  }
  return message;
};

const notifyUser = async (message: IMessage) => {
  WS.notifyUser(message.to.toString(), message);
  return message;
};

const sendNotification = async (input) => {
  const details = {
    type: enums.MessageType.NOTIFICATION,
    body: input.body,
    to: input.to,
  };
  return create(details).then(send).then(notifyUser);
};

const sendMessage = async (input) => {
  const details = {
    type: enums.MessageType.MESSAGE,
    body: input.body,
    from: input.accessor._id,
    to: input.to,
  };
  return create(details).then(send).then(notifyUser);
};

const getAllMessages = async (input) => {
  const { messages } = await User.findById(input.accessor._id, 'messages')
    .populate({
      path: 'messages',
      model: 'Message',
      options: {
        sort: {
          createdAt: -1
        }
      },
      populate: {
        path: 'from to',
        select: SellerSummary,
        model: 'User'
      },
    });
  return messages;
};

const getNotificationCount = async (input) => {
  return Message.aggregate([
    { $match: { to: input.accessor._id, read: false } },
    { $group: { _id: null, unread: { $sum: 1 } } },
  ]).then(doc => {
    return doc[0] || { unread: 0 };
  });
};

const markAsRead = (input) => {
  return Message.findByIdAndUpdate(input.id, { read: true });
};

export = {
  create,
  send,
  sendMessage,
  sendNotification,
  getAllMessages,
  getNotificationCount,
  markAsRead
}