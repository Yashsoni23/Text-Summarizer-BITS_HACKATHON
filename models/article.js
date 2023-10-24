const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
  author: String,
  content: String,
  description: String,
  publishedAt: Date,
  source: {
    id: String,
    name: String,
  },
  title: String,
  url: String,
  urlToImage: String,
});

const Article = mongoose.model("Article", articleSchema);

module.exports = Article;
