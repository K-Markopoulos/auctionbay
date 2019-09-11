import Message, { IMessage } from "../models/message"
import User, { IUser, SellerSummary } from "../models/user";
import enums = require("../models/enums");

const create = async (details: any) => {
  const message = new Message(details);
  return message.save();
};

const send = async (message: IMessage) => {
  await User.findByIdAndUpdate(message.to, {
    $push: {
      messages: message._id
    }
  });
  if (message.from) {
    await User.findByIdAndUpdate(message.from, {
      $push: {
        messages: message._id
      }
    });
  }
  return message;
};

const sendMessage = async (input) => {
  const details = {
    type: enums.MessageType.MESSAGE,
    body: input.body,
    from: input.accessor._id,
    to: input.to,
  };
  return create(details).then(send);
};

const getAllMessages = async (input) => {
  const { messages } = await User.findById(input.accessor._id, 'messages', {
    sort: {
        createdAt: 1
    }
  }).populate({
      path: 'messages',
      model: 'Message',
      populate: {
        path: 'from to',
        select: SellerSummary,
        model: 'User'
      },
    });
  return messages;
};

export = {
  create,
  send,
  sendMessage,
  getAllMessages
}