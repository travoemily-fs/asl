const express = require('express');
const { ContactModel, Pager, sortContacts, filterContacts } = require('@jworkman-fs/asl');

const app = express();
app.use(express.json());
const port = 8080;

app.get('/', (req, res) => {
    res.send('contacts API is running!');
});

// mounting will go here

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});