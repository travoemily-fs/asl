// project dependencies imports
const express = require("express");
const contactsRouter = require("./routes/contacts");

const app = express();
app.use(express.json());

const port = 8080;

app.get("/", (req, res) => {
  res.send("contacts API is running!");
});

// mount routes
app.use("/contacts", contactsRouter);

// global error handling middleware for failsafe
app.use((err, req, res, next) => {
  res.status(500).json({ message: "Something broke on our end!" });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
