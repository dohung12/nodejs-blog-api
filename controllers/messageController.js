const Message = require('../models/message');
const Blog = require('../models/blog');
const { StatusCodes } = require('http-status-codes');
const { body, validationResult } = require('express-validator');

const create_Message = [
  body('content')
    .not()
    .isEmpty()
    .withMessage('Comment must not be empty')
    .trim(),
  async (req, res, next) => {
    //  Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ errors: errors.array() });
    }

    const { content } = req.body;
    const { userId } = req.user;

    const message = new Message({
      content,
      author: userId,
    });

    const blog = await Blog.findById(req.params.blogId);

    // if requested blog doesn't exist
    if (!blog) {
      const msg = `Blog with ID ${req.params.blogId} does not exist`;
      res.status(StatusCodes.NOT_FOUND).json({ msg });
    }

    // Success, append new message to blog's messages array
    await message.save();
    blog.messages.push(message);
    await blog.save();
    res.status(StatusCodes.OK).json({
      blog,
    });
  },
];

const update_Message = [
  body('content')
    .not()
    .isEmpty()
    .withMessage('Blog post content must not be empty')
    .trim(),
  async (req, res, next) => {
    //  Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);

    const { content } = req.body;
    const { userId } = req.user;

    const message = await Message.findOne({
      _id: req.params.messageId,
      author: userId,
    });

    // if updated blog doesn't exist
    if (!message) {
      const msg = `Message with ID ${req.params.messageId} does not exist`;
      res.status(StatusCodes.NOT_FOUND).json({ msg });
    }

    // if validation errors exist
    if (!errors.isEmpty()) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message, errors: errors.array() });
    }

    // Found need to update blog. Update
    message.content = content;
    await message.save();

    const blog = await Blog.findById(req.params.blogId);
    res.status(StatusCodes.OK).json({ blog });
  },
];

const delete_Message = async (req, res, next) => {
  const message = await Message.findByIdAndRemove({
    _id: req.params.messageId,
    author: req.user.userId,
  });

  // message not found
  if (!message) {
    const msg = `Message with ID ${req.params.messageId} does not exist`;
    res.status(StatusCodes.NOT_FOUND).json({ msg });
  }

  res.status(StatusCodes.OK).send();
};

module.exports = { create_Message, update_Message, delete_Message };
