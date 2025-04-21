// project dependencies imports
const express = require("express");
const contactsRouter = require("./routes/contacts");
const axios = require("axios");
const { Curl } = require("node-libcurl");

const app = express();
app.use(express.json());

// mount routes
app.use("/v1/contacts", contactsRouter);

const port = 8080;

app.get("/", (req, res) => {
  res.send("contacts API is running!");
});

// global error handling middleware for failsafe
app.use((err, req, res, next) => {
  res
    .status(500)
    .json({
      message:
        "Something broke on our end! Error details: " + err.message,
    });
  console.error(err.stack);
  next(err);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
