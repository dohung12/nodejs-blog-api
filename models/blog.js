const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { DateTime } = require('luxon');

const BlogSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  messages: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      required: true,
    },
  ],
  publish: {
    type: Boolean,
    default: false,
  },
});

BlogSchema.virtual('createAt_formatted').get(function () {
  return DateTime.fromJSDate(this.createAt).toLocaleString(DateTime.DATE_MED);
});

module.exports = mongoose.model('Blog', BlogSchema);
