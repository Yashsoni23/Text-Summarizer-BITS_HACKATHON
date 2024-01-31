const express = require("express");
const dotenv = require("dotenv").config();
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;
const axios = require("axios");
const mongoose = require("mongoose");

const summarizeText = require("./summarize.js");
const Article = require("./models/article.js"); // Ensure the path to the Article model is correct
const Message = require("./models/message.js");

// Parse JSON bodies (as sent by API clients)
app.use(express.json());
app.use(cors());
app.use(express.static("public")); // Serve static files from the 'public' directory

// Handle POST requests to the '/summarize' endpoint
app.post("/summarize", async (req, res) => {
  const text = req.body.text_to_summarize;

  summarizeText(text, req?.body?.min_length)
    .then((response) => {
      res.json({
        status:true,
        result:response});
    })
    .catch((error) => {
      console.log(error.message);
    });
});

app.get("/", async (req, res) => {
  res.send("summarizer backend");
});

app.get("/blogs", async (req, res) => {
  try {
    const blogs = await Article.find();
    res.send({
      success: true,
      data: blogs,
    });
  } catch (error) {
    console.log(error.message);
    res.send({
      success: false,
      data: "something went wrong " + error.message,
    });
  }
});

app.post("/message", async (req, res) => {
  try {
    const message = await Message.create({
      name: req.body.name,
      email: req.body.email,
      message: req.body.message,
    });
    res.send({ success: true, data: message });
  } catch (error) {
    console.log(error.message);
    res.send({
      success: false,
      data: "something went wrong at message sending time " + error.message,
    });
  }
});

app.get("/newblogs", async (req, res) => {
  try {
    const apiKey = process.env.API_KEY;
    const apiUrl = `https://newsapi.org/v2/everything?q=tech&apiKey=${apiKey}`;

    const data = await axios.get(apiUrl);
    const articles = data.data.articles;

    // Call the function to store articles in the database
    const result = await storeBlogsToDB(articles);

    console.log(data.data.articles);
    res.send({
      success: true,
      data: result, // Send the result of storing articles in the response
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
});

const storeBlogsToDB = async (blogs) => {
  try {
    const result = await Article.insertMany(blogs);
    console.log("Articles inserted successfully");
    return "Successfully stored in the database";
  } catch (error) {
    console.error("Error inserting articles:", error);
    return "Error storing articles in the database";
  }
};

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);

  mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((connection) => {
      console.log(`Connected to http://localhost:${port}`);
    });
});
