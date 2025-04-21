// project dependencies imports
const express = require("express");
const router = express.Router();

// API related imports
const {
  ContactModel,
  sortContacts,
  filterContacts,
  validateContactData,
} = require("@jworkman-fs/asl");
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

    // only apply filtering if all three headers are present
    const by = req.get("X-Filter-By");
    const operator = req.get("X-Filter-Operator");
    const value = req.get("X-Filter-Value");

    const allowedFields = [
      "id",
      "fname",
      "lname",
      "email",
      "phone",
      "birthday",
    ];
    const allowedOps = ["gt", "gte", "lt", "lte", "eq"];

    let filteredContacts = contacts;
    if (by && operator && value) {
      if (!allowedFields.includes(by) || !allowedOps.includes(operator)) {
        // handles 400 bad request error
        return res.status(400).json({
          message: `Bad Request. Invalid filter field or operator.`,
        });
      }

      try {
        filteredContacts = filterContacts(contacts, by, operator, value);
      } catch (err) {
        return next(err);
      }
    }
    // apply sorting if sort query parameter is present
    const sortedContacts = [...filteredContacts];
    // apply sorting that works with lname both ascending and descending
    if (req.query.sort === "lname" && req.query.direction === "desc") {
      sortedContacts.sort((a, b) => b.lname.localeCompare(a.lname));
    } else {
      sortedContacts.sort((a, b) => a.lname.localeCompare(b.lname));
    }

    // pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit ?? req.query.size) || 10;
    const totalItems = sortedContacts.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const pageData = sortedContacts.slice(startIndex, startIndex + limit);

    // set pagination headers
    res.set("X-Page-Total", String(totalPages));
    res.set("X-Page-Next", page < totalPages ? String(page + 1) : "");
    res.set("X-Page-Prev", page > 1 ? String(page - 1) : "");

    return res.json(pageData);
  } catch (err) {
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
    return next(err);
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
      phone: req.body.phone,
      birthday: req.body.birthday,
    };
    // validate the payload fields
    validateContactData(payload);
    // create a new contact - auto throws duplicate error if contact already exists
    const newContact = await ContactModel.create(payload);
    // if successful, redirect to the GET endpoint for the new contact
    return res.status(303).location(`/v1/contacts/${newContact.id}`).end();
  } catch (err) {
    console.error("POST /contacts failed:", err);
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
    return res.status(500).json({ message: "Server error: " + err.message });
  }
});

// PATCH or update contact by ID
router.patch("/:id", async (req, res, next) => {
  // validate and parse the ID
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({
      // handles 400 bad request error
      message: "Bad Request. Invalid contact ID.",
    });
  }

  // checks for null and undefined values in any of the fields
  const { fname, lname, email, phone, birthday } = req.body;
  if (
    fname == null &&
    lname == null &&
    email == null &&
    phone == null &&
    birthday == null
  ) {
    return res.status(400).json({
      // handles 400 bad request error
      message: "Bad Request. At least one field must be provided to update.",
    });
  }

  try {
    // check that contact exists
    const contact = await ContactModel.show(id);
    if (!contact) {
      return res.status(404).json({
        // handles 404 not found error
        message: "Contact not found",
      });
    }

    // merge and validate
    const updated = { ...contact, ...req.body };
    validateContactData(updated);

    // perform the update
    await ContactModel.update(id, updated);

    // returns the updated contact via redirect
    return res.status(303).location(`/v1/contacts/${id}`).end();
  } catch (err) {
    // error catching
    if (
      err.name === "InvalidContactFieldError" ||
      err.name === "BlankContactFieldError" ||
      err.name === "InvalidContactSchemaError" ||
      err.name === "DuplicateContactResourceError"
    ) {
      return res.status(400).json({
        // handles 400 bad request error
        message: "Bad Request. " + err.message,
      });
    }
    if (err.name === "ContactNotFoundError") {
      return res.status(404).json({
        // handles 404 not found error
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
      // handles 400 bad request error
      message: "Bad Request. Invalid contact ID.",
    });
  }
  // checks that all fields are filled out
  const { fname, lname, email, phone, birthday } = req.body;
  if (
    fname == null ||
    lname == null ||
    email == null ||
    phone == null ||
    birthday == null
  ) {
    return res.status(400).json({
      // handles 400 bad request error
      message: "Bad Request. All fields must be provided.",
    });
  }
  try {
    // check that contact exists
    const contact = await ContactModel.show(id);
    if (!contact) {
      // handles 404 not found error
      return res.status(404).json({
        message: "Contact not found",
      });
    }
    // validate payload fields
    validateContactData(req.body);

    // perform the replacement
    await ContactModel.replace(id, req.body);
    // returns the replaced contact via redirect
    return res.status(303).location(`/v1/contacts/${id}`).end();
  } catch (err) {
    // error catching
    if (
      err.name === "InvalidContactFieldError" ||
      err.name === "BlankContactFieldError" ||
      err.name === "InvalidContactSchemaError" ||
      err.name === "DuplicateContactResourceError"
    ) {
      return res.status(400).json({
        // handles 400 bad request error
        message: "Bad Request. " + err.message,
      });
    }
    if (err.name === "ContactNotFoundError") {
      return res.status(404).json({
        // handles 404 not found error
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
    return res.status(303).location("/v1/contacts").end();
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
