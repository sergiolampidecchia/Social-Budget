[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/OLXYiqlj)
# Exam #2: "Budget sociale"
# Student: s331080 LAMPIDECCHIA SERGIO 

# React Client Application Routes

- Route `/`: Login.jsx component (form used for user authentication)
- Route `/budgetform`: BudgetForm.jsx component (form used for entering the initial budget)
- Route `/proposalist`: ProposalList.jsx component (component used to display all the proposals entered by the logged in user)
- Route `/proposalform`: ProposalForm.jsx component (form used to insert a new proposal)
- Route `/proposalform/:id`: ProposalFormEdit.jsx component (form used to modify the proposal whose id is the id of the params)
- Route `/preferencesform`: PreferencesPage.jsx component (component that contains all the proposals and allows logged in user to add a rating to the proposals not inserted by the logged in user)
- Route `/anonymouspage`: AnonymousPage.jsx component (component that displays approved and disapproved proposals based on total score and budget)

# API Server

## User Authentication Management

### Login
- POST `/api/sessions`
  - Description: authenticate the user who is trying to login
  - Request body: credentials of the user who is trying to login

  ``` JSON
  {
      "username": "admin",
      "password": "admin"
  }
  ```

  - Response: `200 OK` (success)
  - Response body: authenticated user

  ``` JSON
  {
    "id": 1,
    "username": "admin",
    "role": "Admin",
    "name": "Michele",
    "surname": "Verdi",
    "address": "Corso Castelfidardo 1, Torino",
    "birthday": "1970-01-01"
  }
  ```

  - Error responses:  `500 Internal Server Error` (generic error), `401 Unauthorized User` (login failed)

### Check if user is logged in 
- GET `/api/sessions/current`
  - Description: check if current user is logged in and get her data
  - Request body: _None_
  - Response: `200 OK` (success)
  - Response body: authenticated user

  ``` JSON
  {
    "id": 1,
    "username": "admin",
    "role": "Admin",
    "name": "Michele",
    "surname": "Verdi",
    "address": "Corso Castelfidardo 1, Torino",
    "birthday": "1970-01-01"
  }
  ```
  - Error responses: `401 Unauthorized User` (user is not logged in)

### Logout
- DELETE `/api/sessions/current`
  - Description: logout current user
  - Request body: _None_
  - Response: `200 OK` (success)
  - Response body: _None_

## Proposals management

### Create a new proposal
- POST `/api/proposals`
  - Description: create a new proposal
  - Request body: description and budget of the proposal
  - Response: `200 OK` (success)
  - Response body content: newly added proposal

  ```json
  {
    "userId": "admin",
    "description": "Proposal 1",
    "budget": 4000
  }
  ```

  - Error responses:  `403 Forbidden` (user is trying to create more than 3 proposals, user is trying to create a proposal in a phase other than 1), `422 Unprocessable Entity` (budget less than or equal to 0 or budget exceed the allowed limit),  `503 Service Unavailable` (database error)

### Get all proposals by userId
- GET `/api/proposals/id`
  - Description: get all logged in user proposals
  - Request body: _None_
  - Response: `200 OK` (success)
  - Response body content: proposals from the logged in user

  ```json
  [
    {
      "id": 180,
      "userId": "admin",
      "description": "Proposal 1",
      "budget": 4000
    },
    {
      "id": 181,
      "userId": "admin",
      "description": "Proposal 2",
      "budget": 4000
    }
  ]
  ```

  - Error responses: `503 Service Unavailable` (database error)

### Get all proposals
- GET `/api/proposals
  - Description: get all proposals
  - Request body: _None_
  - Response: `200 OK` (success)
  - Response body content: proposals from all users

  ```json
  [
    {
      "id": 180,
      "userId": "admin",
      "description": "Proposal 1",
      "budget": 4000
    },
    {
      "id": 181,
      "userId": "admin",
      "description": "Proposal 2",
      "budget": 4000
    },
    {
      "id": 182,
      "userId": "user1",
      "description": "Proposal 1",
      "budget": 1000
    }
  ]
  ```

  - Error responses:  `403 Forbidden` (get all proposals in phase 1), `503 Service Unavailable` (database error)

### Update a proposal 
- PUT `/api/proposals/:id`
  - Description: update a logged in user proposal
  - Request body: description and budget of the proposal
  - Response: `200 OK` (success)
  - Response body content: logged in user proposal updated

   ```json
  {
    "userId": "admin",
    "description": "Proposal 1 modified",
    "budget": 4000
  }
  ```

  - Error responses:  `403 Not Found` (user is trying to update proposal that is not his or user is trying to update his proposal in a phase other than 1 ), `422 Unprocessable Entity` (budget less than or equal to 0 or budget exceed the allowed limit), `503 Service Unavailable` (database error)

### Delete a proposal
- DELETE `/api/proposals/:id`
  - Description: Delete a logged in user proposal
  - Request body: _None_
  - Response: `200 OK` (success)
  - Response body content: true

  ```json
  true
  ```

  - Error responses:  `403 Forbidden` (user is trying to delete proposal that is not his or user is trying to update his proposal in a phase other than 1) `503 Service Unavailable` (database error)

## Preferences management

### Add a preference 
- POST `/api/preferences`
  - Description: Add a preference to a proposal not created by the logged in user
  - Request body: proposalId and score of the preference
  - Response: `200 OK` (success)
  - Response body content: newly added preference

  ```json
  {
    "id": 139,
    "userId": 2,
    "proposalId": 181,
    "score": 3
  }
  ```

  - Error responses: `403 Forbidden` (user is trying to insert a preference in a phase other than 2 or user has already added a preference for this proposal or user is trying to insert a preference for his own proposals) `503 Service Unavailable` (database error)

### Get all preferences
- GET `/api/preferences`
  - Description: get all preferences
  - Request body: _None_
  - Response: `200 OK` (success)
  - Response body content: all preferences

  ```json
  [
    {
      "id": 139,
      "userId": 2,
      "proposalId": 181,
      "score": 3
    },
    {
      "id": 140,
      "userId": 1,
      "proposalId": 182,
      "score": 1
    }
  ]
  ```

  - Error responses: `403 Forbidden` (user is trying to get all preference in a phase other than 3) `503 Service Unavailable` (database error)

### Get all preferences by userId
- GET `/api/preferences/:id`
  - Description: get all logged in user preferences
  - Request body: _None_
  - Response: `200 OK` (success)
  - Response body content: preferences by userId 

  ```json
  [
    {
      "id": 139,
      "userId": 2,
      "proposalId": 181,
      "score": 3
    }
  ]
  ```

  - Error responses: `503 Service Unavailable` (database error)

### Delete a preference
- DELETE `/api/preferences/:proposalId`
  - Description: delete a logged in user preference
  - Request body: _None_
  - Response: `200 OK` (success)
  - Response body content: true

  ```json
  true
  ```

  - Error responses: `403 Forbidden` (user is trying to delete his preference in a phase other than 2) `503 Service Unavailable` (database error)

## Configs management

### Change phase
- POST `/api/phase`
  - Description: Increase phase by one
  - Request body: _None_
  - Response: `200 OK` (success)
  - Response body content: new phase

  ```json
  2
  ```

  - Error responses: `403 Forbidden` (user not admin is trying to change phase or admin is trying to change phase before entering budget) `503 Service Unavailable` (database error)

### Insert initial budget
- POST `/api/budget`
  - Description: Insert initial budget
  - Request body: _None_
  - Response: `200 OK` (success)
  - Response body content: initial budget

  
  ```json
  1000
  ```

  -Error responses: `403 Forbidden` (user not admin is trying to insert budget or admin is trying to insert budget in a phase other than 0), `422 Unprocessable Entity` (budget less than or equal to 0), `503 Service Unavailable` (database error)

### Get current phase
- GET `/api/currentphase`
  - Description: get current phase
  - Request body: _None_
  - Response: `200 OK` (success)
  - Response body content: current phase

  ```json
  2
  ```

  - Error responses: `503 Service Unavailable` (database error)

### Get initial budget
- GET `/api/getbudget`
  - Description: get initial budget
  - Request body: _None_
  - Response: `200 OK` (success)
  - Response body content: initial budget

  ```json
  1000
  ```

  - Error responses: `503 Service Unavailable` (database error)

### Reset all entries
- PUT `/api/reset`
  - Description: reset all entrie
  - Request body:
  - Response: `200 OK` (success)
  - Response body content: 

  - Error responses: `403 Forbidden` (user not admin is trying to insert budget or admin is trying to insert budget in a phase other than 0 or budget less than or equal to 0 ) `503 Service Unavailable` (generic error)

## Database Tables

- Table `users` contains logged in users:
  - id(INTEGER PRIMARY KEY("id" AUTOINCREMENT)) 
  - username(TEXT NOT NULL UNIQUE) 
  - hash(TEXT NOT NULL) 
  - role(TEXT NOT NULL CHECK("role" IN ("Admin", "User")))
  - name(TEXT NOT NULL)
  - surname(TEXT NOT NULL)
  - address(TEXT NOT NULL)
  - birthday(TEXT NOT NULL)
  - salt(TEXT NOT NULL)

- Table `proposals` contains proposals entered by users:
  - id(INTEGER PRIMARY KEY("id" AUTOINCREMENT))
  - userId(INTEGER NOT NULL FOREIGN KEY("userId") REFERENCES "users"("id"))
  - description(TEXT NOT NULL)
  - budget(NUMERIC NOT NULL DEFAULT 0 CHECK("budget" > 0))

- Table `preferences` contains preferences expressed by users associated with proposals:
  - id(INTEGER PRIMARY KEY("id" AUTOINCREMENT))
  - userId(INTEGER NOT NULL FOREIGN KEY("userId") REFERENCES "users"("id"))
  - proposalId(INTEGER NOT NULL FOREIGN KEY("proposalId") REFERENCES "proposals"("id"))
  - score (INTEGER NOT NULL DEFAULT 0 CHECK("score" BETWEEN 1 AND 3))

- Table `configs` contains current phase and initial budget: 
  - id(INTEGER PRIMARY KEY("id" AUTOINCREMENT))
  - phase(INTEGER DEFAULT 0)
  - budget(NUMERIC CHECK("budget" > 0))
## Main React Components

- `App` (in `App.jsx`): App is the main component. It manages the login, logout and recovery of the current session phases. Retrieves the current phase and the budget initially defined by the admin. Defines the routes associated with each React components by passing them the necessary props.
- `Login` (in `Login.jsx`): Login takes handleLogin and current phase as props. When user logged in it manages navigation to other routes based on parameters such as logged in user role and current phase.
- `BudgetForm` (in `BudgetForm.jsx`): BudgetForm takes logged in user and handleLogout as props. If the role of the logged in user is Admin it redirects to the form for entering the initial budget, otherwise to a notice specifying that the admin has yet to enter the initial budget (when logged in user is User) or a notice specifying that there are no approved proposals yet (when user is Anonymous User).
- `ProposalList` (in `ProposalList.jsx`): ProposalList takes logged in user and handleLogout as props. ProposalList retrieves the logged in user's proposals and inserts them into the table. Using the "+" button it renders to ProposalForm component for the insertion of a new proposal. If there are at least one proposal for logged in user, "Edit" and "Delete" buttons are implemented to respectively manage the modification and deletion of the proposals of the logged in user. If logged in user role is Admin there is a button to change the phase.
- `ProposalForm` (in `ProposalForm.jsx`): ProposalForm takes logged in user, initial budget and handleLogout as props. ProposalForm allows the logged in user to insert a new proposal via form. Once submitted, redirect to the ProposalList component. If logged in user role is Admin there is a button to change the phase.
- `ProposalFormEdit` (in `ProposalFormEdit.jsx`): ProposalFormEdit takes logged in user, initial budget and handleLogout as props. ProposalForm allows the logged in user to modify a proposal via form. Once submitted, redirect to the ProposalList component. If logged in user role is Admin there is a button to change the phase.
- `PreferencesPage` (in `PreferencesPage.jsx`): PreferencePage takes logged in user and handleLogout as props. Preference page inserts all the proposals of all users into a table and allows logged in user to insert a rating via form only for the proposals that have not been inserted by the logged in user (on a scale from 1 to 3). If logged in user role is Admin there is a button to change the phase.
- `AnonymousPage` (in `AnonymousPage.jsx`): AnonymousPage takes logged in user, currentPhase and handleLogout as props. AnonymousPage inserts approved proposals into one table and unapproved proposals into another (based on the ratings provided by users and based on the budget entered by whoever created the proposal). If the user is an anonymous user, the user will only be able to see approved proposals. If the user is Admin, a Reset button is implemented to reset all values ​​(phase, initial budget, proposals and preferences).

## Screenshot
![Screenshot](./client/public/Screenshot%202024-07-14%20190044.png)
![Screenshot](./client/public/Screenshot%202024-07-14%20190840.png)

## Users Credentials

| id |   username   | password | role | name | surname | address | birthday |
|----|--------------|----------|------|------|---------|----|-----|
| 1  |   admin      | admin    | Admin | Michele | Verdi | Corso Castelfidardo 1, Torino | 1970-01-01 |
| 2  |   user1      | user1    | User  | Giacomo | Freddi | Corso Duca degli Abruzzi 11, Torino | 2001-12-23 |
| 3  |   user2      | user2    | User  | Francesco | Bianchi | Corso Francia 58, Torino | 2002-03-10 |
| 4  |   user3      | user2    | User  | Antonio | Morrone | Via Pastrengo 30, Torino | 2000-10-12 |