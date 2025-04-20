// project dependencies imports
const router = express.Router();

// API related imports
const {
  ContactModel,
  Pager,
  sortContacts,
  filterContacts,
} = require("@jworkman-fs/asl");
const e = require("express");

// begin RESTful endpoints

/* 
my notes...

logic tree:
filtering -> sorting -> pagination

headers:
X-Filter-By: [field name]
X-Filter-Operator: [equals, contains, startswith, endswith]
X-Filter-Value: [value to filter by]

*/

// GET all contacts
router.get("/", async (req, res, next) => {
  try {
    const contacts = await ContactModel.index();

    // handles filtering logic
    const filteredContacts = filterContacts(
      contacts,
      req.get("X-Filter-By"),
      req.get("X-Filter-Operator"),
      req.get("X-Filter-Value")
    );

    // handles sorting logic
    const sortedContacts = sortContacts(
      filteredContacts,
      req.query.sort,
      req.query.direction
    );

    // handles pagination logic
    const pager = new Pager(
      sortedContacts,
      // sets page number
      Number(req.query.page) || 1,
      // sets number of items per page
      Number(req.query.size) || 10
    );

    // sets page total and navigation options
    res.set("X-Page-Total", pager.total());
    res.set("X-Page-Next", pager.next());
    res.set("X-Page-Prev", pager.prev());

    // declare page results
    const pageData = pager.results();

    // returns the paginated contacts
    return res.json(pageData);
    // error catching
  } catch (err) {
    // handles 400 invalid enum type error
    if (err.name === "InvalidEnumError") {
      return res.status(400).json({
        message: "Bad Request. Invalid enum type.",
      });
    }
    // handles 416 out of bounds error
    if (err.name === "PagerOutOfRangeError") {
      return res.status(416).json({
        message: "Requested page is out of range.",
      });
    }
    // handles 400 page limit exceeded error
    if (err.name === "PagerLimitExceededError") {
      return res.status(400).json({
        message: "Bad Request. Page limit exceeded.",
      });
    }
    return next(err);
  }
});

// GET a contact by ID
router.get("/:id", async (req, res, next) => {
  //validate and parse the ID
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    // handles 400 bad request error
    return res.status(400).json({
      message: "Bad Request. Invalid contact ID.",
    });
  }
  try {
    const contact = await ContactModel.show(id);
    // check to make sure contact exists
    if (!contact) {
      // handles 404 not found error
      return res.status(404).json({
        message: "Contact not found",
      });
    }
    // returns the contact if successfully found
    return res.status(200).json(contact);
  } catch (err) {
    // handles known exceptions
    if (err.name === "ContactNotFoundError") {
      return res.status(404).json({
        message: "Contact not found",
      });
    }
    next(err);
  }
});

// POST a new contact
router.post("/", async (req, res, next) => {
  try {
    // extract needed fields from the request body
    const payload = {
      fname: req.body.fname,
      lname: req.body.lname,
      email: req.body.email,
      birthday: req.body.birthday,
    };
    // validate the payload fields
    ContactModel.validate(payload);
    // create a new contact - auto throws duplicate error if contact already exists
    const newContact = await ContactModel.create(payload);
    // if successful, redirect to the GET endpoint for the new contact
    return res.status(303).location(`/contacts/${newContact.id}`).end();
  } catch (err) {
    // handles known exceptions
    if (
      [
        "InvalidContactFieldError",
        "BlankContactFieldError",
        "InvalidContactSchemaError",
        "DuplicateContactResourceError",
      ].includes(err.name)
    ) {
      return res.status(400).json({
        message: "Bad Request. " + err.message,
      });
    }
    return next(err);
  }
});

// PATCH or update contact by ID
router.patch("/:id", async (req, res, next) => {
  // validate and parse the ID
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({
      message: "Bad Request. Invalid contact ID.",
    });
  }
  // checks for null and undefined values in any of the fields
  const { fname, lname, email, birthday } = req.body;
  if (fname == null && lname == null && email == null && birthday == null) {
    return res.status(400).json({
      message: "Bad Request. At least one field must be provided to update.",
    });
  }
  try {
    // check that contact exists
    const contact = await ContactModel.show(id);
    if (!contact) {
      return res.status(404).json({
        message: "Contact not found",
      });
    }
    // validate payload fields
    ContactModel.validate(req.body);

    // perform the update
    await ContactModel.update(id, req.body);
    // returns the updated contact via redirect
    return res.status(303).location(`/contacts/${id}`).end();
  } catch (err) {
    // error catching
    if (
      // checks for invalid fields
      err.name === "InvalidContactFieldError" ||
      // checks for blank fields
      err.name === "BlankContactFieldError" ||
      // checks for invalid schema
      err.name === "InvalidContactSchemaError" ||
      // checks for duplicate contacts
      err.name === "DuplicateContactResourceError"
    ) {
      return res.status(400).json({
        message: "Bad Request. " + err.message,
      });
    }
    if (err.name === "ContactNotFoundError") {
      return res.status(404).json({
        message: "Contact not found",
      });
    }
    return next(err);
  }
});

// PUT or replace contact by ID
router.put("/:id", async (req, res, next) => {
  // parse and validate the ID
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({
      message: "Bad Request. Invalid contact ID.",
    });
  }
  // checks that all four fields are filled out
  const { fname, lname, email, birthday } = req.body;
  if (fname == null || lname == null || email == null || birthday == null) {
    return res.status(400).json({
      message: "Bad Request. All fields must be provided.",
    });
  }
  try {
    // check that contact exists
    const contact = await ContactModel.show(id);
    if (!contact) {
      return res.status(404).json({
        message: "Contact not found",
      });
    }
    // validate payload fields
    ContactModel.validate(req.body);

    // perform the update
    await ContactModel.update(id, req.body);
    // returns the updated contact via redirect
    return res.status(303).location(`/contacts/${id}`).end();
  } catch (err) {
    // error catching
    if (
      // checks for invalid fields
      err.name === "InvalidContactFieldError" ||
      // checks for blank fields
      err.name === "BlankContactFieldError" ||
      // checks for invalid schema
      err.name === "InvalidContactSchemaError" ||
      // checks for duplicate contacts
      err.name === "DuplicateContactResourceError"
    ) {
      return res.status(400).json({
        message: "Bad Request. " + err.message,
      });
    }
    if (err.name === "ContactNotFoundError") {
      return res.status(404).json({
        message: "Contact not found",
      });
    }
    return next(err);
  }
});

// DELETE a contact by ID
router.delete("/:id", async (req, res, next) => {
  // validate and parse the ID
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({
      message: "Bad Request. Invalid contact ID.",
    });
  }
  try {
    // perform the deletion task
    await ContactModel.remove(id);
    // redirect when finished
    return res.status(303).location("/contacts").end();
  } catch (err) {
    // handles known exceptions
    if (err.name === "ContactNotFoundError") {
      return res.status(404).json({
        message: "Contact not found",
      });
    }
    // catching global errors
    return next(err);
  }
});

module.exports = router;
