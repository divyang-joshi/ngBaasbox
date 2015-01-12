# Global





* * *

### init(url, appcode, session) 

Initialize baasbox

**Parameters**

**url**: , Where all api call will be made. This is the base URL with the slash after the url included.
 As an example: www.myServer.com/ or 192.168.1.1:800/

**appcode**: , The application code you first ran the application with. The default is 1234567890

**session**: , The session code if it exists.



### signup(user) 

Registers a new user

**Parameters**

**user**: , A JSON object representing a user.

**Returns**: `*`, A promise, with success containing the data (contains user, signUpDate, X-BB-SESSION).


### login(username, password) 

Login a user

**Parameters**

**username**: , the username

**password**: , the password

**Returns**: `*`, - A promise, with success containing the data (contains user, signUpDate, X-BB-SESSION).


### logout() 

TODO: Implement the pushToken

Logout the user from the server

**Returns**: `*`, - Promise, which if a success, returns "user logged out"


### me() 

Retrieves details about the logged in user

**Returns**: `*`, - Promise with the user returned


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


### Post_Json(url, data) 

Use this method to post by passing data as a JSON

**Parameters**

**url**: , Which url to post to. Include only the API url, e.g "api/user"

**data**: , Data the pass as a JSON object, e.g object name:"test",age:21

**Returns**: `*`, - A promise, with success containing the response data (not the code, the actual data)


### Post_Encoded(url, data) 

Use this method to post by passing data as encoded URL, for example:
 -d "username=cesare" -d "password=password"

**Parameters**

**url**: , Which url to post to. Include only the API url, e.g "api/user"

**data**: , Data the pass as a JSON object, e.g object name:"test",age:21

**Returns**: `*`, - A promise, with success containing the response data (not the code, the actual data)


### Get(url, arg) 

For all GETs. Providing no arg means its a get all.

**Parameters**

**url**: , Which url to post to. Include only the API url, e.g "api/user"

**arg**: , What item to fetch, for example: "cesare"
 Note: The final url would translate to: "api/user/cesare"

**Returns**: `*`, - A promise, with success containing the response data (not the code, the actual data)


### Put(url, data) 

For all PUTs with JSON data.

**Parameters**

**url**: , Which url to post to. Include only the API url, e.g "api/user"

**data**: , Data the pass as a JSON object, e.g object name:"test",age:21

**Returns**: `*`, - A promise, with success containing the response data (not the code, the actual data)


### Delete(url, id) 

For all DELETEs

**Parameters**

**url**: , Which url to call delete. Include only the API url, e.g "api/user"

**id**: , Id of the said object to delete

**Returns**: `*`, - A promise, with success containing the response data (not the code, the actual data)


### makeNewUserData(user) 

Stringify the user object

**Parameters**

**user**: , As in parent

**Returns**: `*`, - String


### updateCurrentToString(user) 

Stringify the user object with only fields (no username and password)

**Parameters**

**user**: , As in parent

**Returns**: `*`, - String


### getDocUrl(collectionName) 

Generate a url for documents. Adds document/collectionName

**Parameters**

**collectionName**: , The name of the collection

**Returns**: `string`, - String of the URL



* * *










