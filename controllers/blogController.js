const Blog = require('../models/blog');
const { StatusCodes } = require('http-status-codes');
const { body, validationResult } = require('express-validator');

const getAllBlog = async (req, res, next) => {
  const blogs = await Blog.find()
    .populate('author', 'username')
    .sort('createdAt');

  res.status(StatusCodes.OK).json({ blogs, count: blogs.length });
};

const createBlog = [
  body('title')
    .not()
    .isEmpty()
    .withMessage('Blog post title must not be empty')
    .trim(),
  body('content')
    .not()
    .isEmpty()
    .withMessage('Blog post content must not be empty')
    .trim(),
  body('publish').toBoolean(),

  async (req, res, next) => {
    //  Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, publish } = req.body;
    const { userId } = req.user;

    const blog = new Blog({
      title,
      content,
      author: userId,
      publish,
    });

    try {
      blog.save();
      res.status(StatusCodes.CREATED).json({ blog });
    } catch (error) {
      next(error);
    }
  },
];

const getBlog = async (req, res, next) => {
  const blog = await Blog.findById(req.params.blogId)
    .populate('author', 'username')
    .populate('messages');

  // blog doesn't exist
  if (!blog) {
    const error = new Error(`Can not found blog with id ${req.params.blogId}`);
    error.status = StatusCodes.NOT_FOUND;
    return next(error);
  }

  // Success, return result
  res.status(StatusCodes.OK).json({ blog });
};

const updateBlog = [
  body('title')
    .not()
    .isEmpty()
    .withMessage('Blog post title must not be empty')
    .trim(),
  body('content')
    .not()
    .isEmpty()
    .withMessage('Blog post content must not be empty')
    .trim(),
  body('publish').toBoolean(),

  async (req, res, next) => {
    //  Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);

    const { title, content, publish } = req.body;
    const { userId } = req.user;

    const blog = await Blog.findOne({
      _id: req.params.blogId,
      author: userId,
    });

    // if updated blog doesn't exist
    if (!blog) {
      const msg = `Blog with ID ${req.params.blogId} does not exist`;
      res.status(StatusCodes.NOT_FOUND).json({ msg });
    }

    // if validation errors exist
    if (!errors.isEmpty()) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ blog, errors: errors.array() });
    }

    // Found need to update blog. Update

    blog.title = title;
    blog.content = content;
    blog.publish = publish;
    await blog.save();
    res.status(StatusCodes.OK).json({
      blog,
    });
  },
];

const deleteBlog = async (req, res, next) => {
  // get the requested blog
  const blog = await Blog.findByIdAndRemove({
    _id: req.params.blogId,
    author: req.user.userId,
  });

  // if requested blog doesn't exist
  if (!blog) {
    const msg = `Blog with ID ${req.params.blogId} does not exist`;
    res.status(StatusCodes.NOT_FOUND).json({ msg });
  }

  // Success
  res.status(StatusCodes.OK).send();
};

module.exports = { getAllBlog, createBlog, getBlog, updateBlog, deleteBlog };
