# ngBaasbox

An angular wrapper for Baasbox. Support for version 0.9.0 so far.

Notes: 
1. The documentation is incomplete. 
2. All results are promises. (Other than init)
3. Files and Assets are not yet implemented
4. There are functions in the SDK that are incomplete. Anything with TODO in its comments is incomplete/may not work as desired.
5. How you store the login session/result is left to you. This could change in the future :)

## Documentation - Summary
### Public Functions - User Related
| Function | Description |
|---|---|
|init(options)|Initialize baasbox. Needed to use this plugin|
|signup(user)|Registers a new user|
|login(username, password)|Login a user|
|logout()|Logout the user from the server|
|me()|Retrieves details about the logged in user|
|updateProfile(user)|Updates the user profile|
|getSingleUser(username)|Allows to retrieve information about a user profile|
|getAllUsers(query)|Retrieve a list of users. This API supports pagination and query criteria|
|followUser(username)|Follow a user|
|unfollowUser(username) |Unfollow a user|
|fetchFollowing(username) | Fetch the list of users following the user|
|fetchFollowers(username) | Get the list of users the user is following |

### Public Functions - Database Related
| Function | Description |
|---|---|
|addDocument(collectionName, data) | Create a new document |
|getDocument(collectionName, id) | Get the document using the unique ID |
|searchForDocuments(collectionName, query) | Search for documents, using some query |
|getDocumentCount(collectionName, query) | Returns the number of documents that the user can read in a collection |
|updateDocument(collectionName, id, data) | Updates the document with the ID provided in the specified collection |
|updateDocumentField(collectionName, id, fieldname, data) | Updates a single field of an existing object. The field can be a simple property, a complex JSON object or even an array using the notation|
|deleteDocument(collectionName, id) | Deletes the document with the ID specified in the collection provided as parameter|
| grantPermissionByUser(collectionName, id, action, username) | Grants permission to the document to a single user|
| grantPermissionByRole(collectionName, id, action, role) | Grants permission to the document to a single role |
| revokePermissionByUser(collectionName, id, action, username) | Revokes permission on a document to the user |
| revokePermissionByRole(collectionName, id, action, role) | Revokes permission on a document to the role |
|createLink(sourceId, destinationId, label) |Links allow to connect documents and files to each other. To create a link you must provide the two documents you want to connect and the link name. Since links have a direction, the first document will be the source node of the link and the second one will be the destination node.|
|getLinkById(id) | Get link by Id|
| queryLink(query) | Get a single or multiple links using a query. |
| deleteLink(id) | Deletes a link |

## Documentation - Detailes & Examples

### init(options) 

Initialize baasbox

**Parameters**

**options**: An object, containing the following:

- *url* - Where all api call will be made. This is the base URL with the slash after the url included. As an example: www.myServer.com/ or 192.168.1.1:800/ 
- *appCode* - The application code you first ran the application with. The default is 1234567890.
- *session* - The session got after logging in (X-BB-SESSION). Default is null.
- *iOSPushToken* - The push notification token code for ios.
- *androidPushToken* - The push notification token code for android.
- *facebookSocialToken* - The social token for facebook.
- *facebookSocialSecret* - The social secret for facebook.
- *googleSocialToken* - The social token for google.
- *googleSocialSecret* - The social secret for google.

**example**:
```
// In case you store the session somewhere. For example to localStorage.
$baasbox.init({
    url: "http://localhost:9000",
    appCode: 1234567890,
    session: User.getSession()
});

OR
// In case you aren't storing the session. Refreshing the broswer will
// destroy the session inside $baasbox, so be sure store that somewhere.
$baasbox.init({
    url: "http://localhost:9000",
    appCode: 1234567890
});
```

### `signup(user)` 

Registers a new user

**Parameters**

**user**: , A JSON object representing a user.

**Returns**: `*`, A promise, with success containing the data (contains user, signUpDate, X-BB-SESSION).

**example**:

```
$baasbox.signup({username:'cesare', password:'password'})
    .then(function (response) { //Success
        console.log(response);
    }, function (error) { // Fail
        console.log(error);
    });

console:
"user": {
    "name": "cesare",
    "status": "ACTIVE",
    "roles": [{
        "name": "registered"
    }]
},
"signUpDate": "2014-01-23 23:00:18",
"X-BB-SESSION": "db7634df-1002-45a2-b2ab-0f6b8556a1fe"
```

### `login(username, password)` 

Login a user

**Parameters**

**username**: , the username

**password**: , the password

**Returns**: `*`, - A promise, with success containing the data (contains user, signUpDate, X-BB-SESSION).

**example**:
```
$baasbox.login('cesare', 'password')
    .then(function (user) {
        User.setUser(user);
        console.log(user);
    }, function (err) {
        console.log(error);
    });

console:
"user": {
    "name": "cesare",
    "status": "ACTIVE",
    "roles": [{
        "name": "registered"
    }]
},
"signUpDate": "2014-01-23 23:00:18",
"X-BB-SESSION": "db7634df-1002-45a2-b2ab-0f6b8556a1fe"
```

### `logout()` 

`TODO:` Implement the pushToken

Logout the user from the server

**Returns**: `*`, - Promise, which if a success, returns "ok"

**example**:
```
$baasbox.logout()
    .then(function (response) {
        User.destroyUser();
        console.log(response);
    }, function (error) {
        console.log(error);
    });

console:
"ok"
```

### `me()`

Retrieves details about the logged in user

**Returns**: `*`, - Promise with the user returned

**example**:
```
// Notice how the session is not returned here.
$baasbox.me()
    .then(function (response) { //Success
        console.log(response);
    }, function (error) { // Fail
        console.log(error);
    });

console:
"user": {
    "name": "cesare",
    "status": "ACTIVE",
    "roles": [{
        "name": "registered"
    }]
},
"signUpDate": "2014-01-23 23:00:18",
```

### updateProfile(user) 

Updates the user profile.

**Parameters**

**user**: , Is of format: Should have 4 objects of the keys:
visibleByTheUser, visibleByFriends, visibleByRegisteredUsers, visibleByAnonymousUsers,
where any of the 4, or all can be provided.

**Returns**: `*`, - Promise with the user returned

### getSingleUser(username) 

Allows to retrieve information about a user profile

**Parameters**

**username**: , Who to fetch

**Returns**: `*`, - Promise with the user returned

### getAllUsers(query) 

Retrieve a list of users. This API supports pagination and query criteria
See http://www.baasbox.com/documentation/?shell#pagination-and-query-criteria

**Parameters**

**query**: , pagination and query criteria

**Returns**: `*`, - Promise with the users returned

### followUser(username) 

Follow a user

**Parameters**

**username**: , User to follow

**Returns**: `*`, - Promise with "ok"

### unfollowUser(username) 

Unfollow a user

**Parameters**

**username**: , User to unfollow

**Returns**: `*`, - Promise with "ok"

### fetchFollowing(username) 

Fetch the list of users following the user

**Parameters**

**username**: , username of the user

**Returns**: `*`, - Promise of users

### fetchFollowers(username) 

Get the list of users the user is following

**Parameters**

**username**: , username of the user

**Returns**: `*`, - Promise of users

### addDocument(collectionName, data) 

Create a new document

**Parameters**

**collectionName**: , Which collection to add this document in

**data**: , Document Data

**Returns**: `*`, - Promise containing the saved document

### getDocument(collectionName, id) 

Get the document using the unique ID

**Parameters**

**collectionName**: , The name of the collection

**id**: , Unique ID to get

**Returns**: `*`, - Promise containing the document

### searchForDocuments(collectionName, query) 

Search for documents, using some query.

**Parameters**

**collectionName**: , The name of the collection

**query**: , the query to find the documents, for example:
query = page=0&recordsPerPage=1

**Returns**: `*`, - Promise containing documents

### getDocumentCount(collectionName, query) 

Returns the number of documents that the user can read in a collection

**Parameters**

**collectionName**: , The name of the collection

**query**: , (Optional) The query to apply before returning the result

**Returns**: `*`, - Promise containing documents

### updateDocument(collectionName, id, data) 

Updates the document with the ID provided in the specified collection

**Parameters**

**collectionName**: , The name of the collection

**id**: , The unique ID of the document

**data**: , The document data (replaces everything)

**Returns**: `*`, - Promise containing the document

### updateDocumentField(collectionName, id, fieldname, data) 

Updates a single field of an existing object. The field can be a simple property,
a complex JSON object or even an array using the notation

**Parameters**

**collectionName**: , The name of the collection

**id**: , The ID of the document

**fieldname**: , The name of the field that you want to update

**data**: , What to update to

**Returns**: `*`, - Promise containing the document

### deleteDocument(collectionName, id) 

Deletes the document with the ID specified in the collection provided as parameter

**Parameters**

**collectionName**: , The name of the collection

**id**: , The ID of the document to delete

**Returns**: `*`, - Promise containing no returned data

### grantPermissionByUser(collectionName, id, action, username) 

Grants permission to the document to a single user

**Parameters**

**collectionName**: , The name of the collection

**id**: , The ID of the document

**action**: , The grant you want to assign. One of: read, update, delete, all.

**username**: , The username of the user to whom you want to assign the grant

**Returns**: `*`, - Promise containing no returned data

### grantPermissionByRole(collectionName, id, action, role) 

Grants permission to the document to a single role

**Parameters**

**collectionName**: , The name of the collection

**id**: , The ID of the document

**action**: , The grant you want to assign. One of: read, update, delete, all.

**role**: , The name of the role to whom you want to grant the permission
One of: anonymous, registered, administrator, plus those defined by the administrator

**Returns**: `*`, - Promise containing no returned data

### revokePermissionByUser(collectionName, id, action, username) 

Revokes permission on a document to the user

**Parameters**

**collectionName**: , The name of the collection

**id**: , The ID of the document

**action**: , The grant you want to revoke. One of: read, update, delete, all.

**username**: , The username of the user to whom you want to revoke the grant

**Returns**: `*`, - Promise containing no returned data

### revokePermissionByRole(collectionName, id, action, role) 

Revokes permission on a document to the role

**Parameters**

**collectionName**: , The name of the collection

**id**: , The ID of the document

**action**: , The grant you want to revoke. One of: read, update, delete, all.

**role**: , The name of the role to whom you want to revoke the permission
One of: anonymous, registered, administrator, plus those defined by the administrator

**Returns**: `*`, - Promise containing no returned data

### createLink(sourceId, destinationId, label) 

Links allow to connect documents and files to each other.
To create a link you must provide the two documents you want to connect and the link name.
Since links have a direction, the first document will be the source node of the link and
the second one will be the destination node.

**Parameters**

**sourceId**: , The ID of the first document or file to link

**destinationId**: , The ID of the second document or file to link

**label**: , The link name. Can be any valid string

**Returns**: `*`, - Promise containing non-writable fields about the link

### getLinkById(id) 

Get link by Id

**Parameters**

**id**: , Id of the link

**Returns**: `*`, - Promise containing non-writable fields about the link

### queryLink(query) 

Get a single or multiple links using a query.

**Parameters**

**query**: , the query.  For example:
where=in.name.toLowerCase() like 'john%' and label="customer"

**Returns**: `*`, - Promise containing an array of links

### deleteLink(id) 

Deletes a link

**Parameters**

**id**: , Id of the link

**Returns**: `*`, - Promise containg no data, just "ok" if success

* * *