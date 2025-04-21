# contacts API: route scaffolding / psuedocode / ramblings of madness

## GET v1/contacts

- define and declare contacts object w/ ContactModels
- check to see what values are being passed in the header
- only allow filtering to proceed if all headers are present
- handle filtering logic w/ filterContacts
- filtering is checked accordingly :
- field:string; operator:string; value:string, w/ Contact[] at the end of the function
- EXPLICITLY define allowed filtering fields and operators (use the blocks below for reference)

> filterContacts(
> allContacts: Contact[],
> opts: { field: string; operator: string; value: string }
> ): Contact[]

- allowed input fields:

  - "id", "fname", "lname", "email", "phone", "birthday"

- allowed ops:

  - "gt", "gte", "lt", "lte", "eq"

- check for bad filter headers throwing InvalidEnumErrors
  - catch the error and return a 400 like the test outlines
- apply date format for birthday by defining a value to it
- apply the filtering w/ the new birthday format included
- handle sorting logic w/ sortContacts
- set up sorting
- use an if/else logic check that makes sure sorting works with lname in descending and ascending queries... if lname(b) is descending(a) or ascending(a) and lname(b)
- calculate pagination headers
- use slice() method to manually handle pagination navigation

- follow this logic:

  > ... if page is less than total pages, set next page header
  > ... if page is greater than 1, set previous page header

- headers for reference:
- x-page-total
- x-page-next
- x-page-prev
- construct pagination setup w/ page total and next/prev functionality
- declare page results variable
  - return page data
    - specifically map out the six input fields
  - begin try/catch error handling...
    - 400 invalid page enum type error
    - 416 out of bounds error
    - 400 page limit error
    - return next(err)

GET NOTES:

- console logs are your friend; use them!
- remember to check values being passed in header!!!!
- remember that sortContacts will throw enum error if passing undefined for the sort field or direction.
- if query.sort or .direction is missing, passing fname/asc so sortContacts can't throw an error
- only call filterContacts when the X-Filter-\* is sent to avoid undefined error

## GET v1/contacts/:id

- declare and define id variable
  - parse into number
  - begin try/catch error handling...
    - handle 400 invalid/bad request error
    - handle 404 not found error
    - return contact if found w/ 200 status code
      - handle following known exceptions...
        - 404 ContactNotFound error
        - return next(err)

## POST v1/contacts

- extract field data w/ a body request
- validate the payload fields
- create new contact variable using create method
- if successful, 303 redirect to the newly created GET endpoint for contact
  - begin try/catch error handling...
    - handle following known exceptions
      - InvalidContactFieldError
        - checks for invalid field inputs
      - BlankContactFieldError
        - checks for blank input fields
      - InvalidContactSchemaError
        - checks for errors in contact schema
      - DuplicateContactResourceError
        - checks for duplicate contact
          - all these will return a 400 bad request error + specific error thrown

## PATCH v1/contacts/:id (altering at least one field input)

- define and declare id variable
  - parse into number
  - begin try/catch error handling
    - handle 400 invalid contact id error
- check for null and/or undefined values in any of the input fields
  - begin try/catch error handling
    - throw 400 bad request error for no field updated
    - throw 404 contact not found error
- validate payload fields with validate method
- perform the update w/ an await function
  - return 303 redirect status code with updated contact information
  - handle following known exceptions
    - InvalidContactFieldError
      - checks for invalid field inputs
    - BlankContactFieldError
      - checks for blank input fields
    - InvalidContactSchemaError
      - checks for errors in contact schema
    - DuplicateContactResourceError
      - checks for duplicate contact
        - all these will return a 400 bad request error + specific error thrown
      - runs check to ensure contact is found, returns 404 not found error if fails
      - return next(err)

## PUT v1/contacts/:id (replacement of all field inputs)

- define and declare id variable
  - parse into number
  - begin try/catch error handling
    - handle 400 invalid contact id error
- check to make sure all fields are filled out
  - begin try/catch error handling
    - throw 400 bad request error for no field updated
    - throw 404 contact not found error
- check that contact exists
  - throw 404 if not found
- validate payload fields with validate method
- perform the replacement w/ an await function
  - return 303 redirect status code with updated contact information
  - handle following known exceptions
    - InvalidContactFieldError
      - checks for invalid field inputs
    - BlankContactFieldError
      - checks for blank input fields
    - InvalidContactSchemaError
      - checks for errors in contact schema
    - DuplicateContactResourceError
      - checks for duplicate contact
        - all these will return a 400 bad request error + specific error thrown
      - runs check to ensure contact is found, returns 404 not found error if fails
      - return next(err)

## DELETE v1/contacts/:id

- define and declare id variable
  - parse into number
  - begin try/catch error handling
    - handle 400 invalid contact id error
- perform deletion task
  - return 303 redirect status code when successfully deleted
  - handle following known exceptions
    - original contact not found 404 error
  - return next(err)
