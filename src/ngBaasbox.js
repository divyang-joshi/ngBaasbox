angular.module('ngBaasbox', [
    'ngBaasbox.api'
]);

angular.module('ngBaasbox.api', [])

.factory('$baasbox', ['$q',
    function ($q) {

        var BASEURL = "";
        var APPCODE = 1234567890;
        var SESSION = null;

        return {

            /**
             * Initialize baasbox
             * @param url - Where all api call will be made. This is the base URL with the slash after the url included.
             *  As an example: www.myServer.com/ or 192.168.1.1:800/
             * @param appcode - The application code you first ran the application with. The default is 1234567890
             * @param session - The session code if it exists.
             */
            init: function (url, appcode, session) {
                BASEURL = url;
                APPCODE = appcode;
                SESSION = session;
            },

            /*======================================================*
                USER
             *======================================================*/

            /*
             *  user = {
             *      username: "user",
             *      password: "pass",
             *      visibleByTheUser: {
             *          email: "test@test.com",
             *          cell: "800-900-1000"
             *      },
             *      visibleByFriends: {
             *          first: "Name",
             *          last: "Last"
             *      },
             *      visibleByRegisteredUsers: {
             *          nickname: "nick"
             *      },
             *      visibleByAnonymousUsers: {}
             *  }
             */

            /**
             * Registers a new user
             * @param user - A JSON object representing a user.
             * @returns {*} A promise, with success containing the data (contains user, signUpDate, X-BB-SESSION).
             *
             */
            signup: function (user) {
                var q = $q.defer();
                Post_Json("user", makeNewUserData(user)).then(function (response) {
                    SESSION = response["X-BB-SESSION"];
                    q.resolve(response);
                }, function (err) {
                    q.reject(err);
                });
                return q.promise;
            },

            /**
             * Login a user
             * @param username - the username
             * @param password - the password
             * @returns {*} - A promise, with success containing the data (contains user, signUpDate, X-BB-SESSION).
             */
            login: function (username, password) {
                var passData = {
                    username: username,
                    password: password,
                    appcode: APPCODE
                };
                var q = $q.defer();
                Post_Encoded("login", passData).then(function (response) {
                    SESSION = response["X-BB-SESSION"];
                    q.resolve(response);
                }, function (response) {
                    console.log(response);
                    q.reject(response);
                });
                return q.promise;
            },

            /**
             * TODO: Implement the pushToken
             *
             * Logout the user from the server
             * @returns {*} - Promise, which if a success, returns "user logged out"
             */
            logout: function () {
                var q = $q.defer();
                Post_Json("logout", "").then(function (response) {
                    SESSION = null;
                    q.resolve(response);
                }, function (err) {
                    q.reject(err);
                });
                return q.promise;
            },

            /**
             * Retrieves details about the logged in user
             * @returns {*} - Promise with the user returned
             */
            me: function () {
                return Get("me", null, null);
            },

            /*
             { "visibleByTheUser": {}, "visibleByFriends": {}, "visibleByRegisteredUsers": {}, "visibleByAnonymousUsers": {} }
             */

            /**
             * Updates the user profile.
             * @param user - Is of format: Should have 4 objects of the keys:
             *  visibleByTheUser, visibleByFriends, visibleByRegisteredUsers, visibleByAnonymousUsers,
             *  where any of the 4, or all can be provided.
             * @returns {*} - Promise with the user returned
             */
            updateProfile: function (user) {
                return Put("me", updateCurrentToString(user), null)
            },

            /**
             * Allows to retrieve information about a user profile
             * @param username - Who to fetch
             * @returns {*} - Promise with the user returned
             */
            getSingleUser: function (username) {
                return Get("user", username, null);
            },

            /**
             * Retrieve a list of users. This API supports pagination and query criteria
             *  See http://www.baasbox.com/documentation/?shell#pagination-and-query-criteria
             * @param query - pagination and query criteria
             * @returns {*} - Promise with the users returned
             */
            getAllUsers: function (query) {
                return Get("users", null, query);
            },

            // TODO: Implement
            changePassword: function () {
                console.log("Not implemented yet.")
            },

            // TODO: Implement
            forgotPassword: function () {
                console.log("Not implemented yet.")
            },

            // TODO: Implement
            suspendUser: function () {
                console.log("Not implemented yet.")
            },

            // TODO: Implement
            activateUser: function () {
                console.log("Not implemented yet.")
            },

            // TODO: Implement
            changeUsername: function () {
                console.log("Not implemented yet.")
            },

            /*======================================================*
                 FRIENDS
             *======================================================*/

            /**
             * Follow a user
             * @param username - User to follow
             * @returns {*} - Promise with "ok"
             */
            followUser: function (username) {
                return Post_Json("follow/" + username, {});
            },

            /**
             * Unfollow a user
             * @param username - User to unfollow
             * @returns {*} - Promise with "ok"
             */
            unfollowUser: function (username) {
                return Delete("follow", username);
            },

            /**
             * Fetch the list of users following the user
             * @param username - username of the user
             * @returns {*} - Promise of users
             */
            fetchFollowing: function (username) {
                return Get("following", username, null);
            },

            /**
             * Get the list of users the user is following
             * @param username - username of the user
             * @returns {*} - Promise of users
             */
            fetchFollowers: function (username) {
                return Get("followers", username, null);
            },

            /*======================================================*
                DOCUMENTS
             *======================================================*/

            /**
             * Create a new document
             * @param collectionName - Which collection to add this document in
             * @param data - Document Data
             * @returns {*} - Promise containing the saved document
             */
            addDocument: function (collectionName, data) {
                return Post_Json(getDocUrl(collectionName), data);
            },

            /**
             * Get the document using the unique ID
             * @param collectionName - The name of the collection
             * @param id - Unique ID to get
             * @returns {*} - Promise containing the document
             */
            getDocument: function (collectionName, id) {
                return Get(getDocUrl(collectionName), id, null);
            },

            /**
             * Search for documents, using some query.
             * @param collectionName - The name of the collection
             * @param query - the query to find the documents, for example:
             *  query = page=0&recordsPerPage=1
             * @returns {*} - Promise containing documents
             */
            searchForDocuments: function (collectionName, query) {
                return Get(getDocUrl(collectionName), null, query);
            },

            /**
             * Returns the number of documents that the user can read in a collection
             * @param collectionName - The name of the collection
             * @param query - (Optional) The query to apply before returning the result
             * @returns {*} - Promise containing documents
             */
            getDocumentCount: function (collectionName, query) {
                return Get(getDocUrl(collectionName), null, query);
            },

            /**
             * Updates the document with the ID provided in the specified collection
             * @param collectionName - The name of the collection
             * @param id - The unique ID of the document
             * @param data - The document data (replaces everything)
             * @returns {*} - Promise containing the document
             */
            updateDocument: function (collectionName, id, data) {
                return Put(getDocUrl(collectionName), data, id);
            },

            /**
             * Updates a single field of an existing object. The field can be a simple property,
             * a complex JSON object or even an array using the notation
             * @param collectionName - The name of the collection
             * @param id - The ID of the document
             * @param fieldname - The name of the field that you want to update
             * @param data - What to update to
             * @returns {*} - Promise containing the document
             */
            updateDocumentField: function (collectionName, id, fieldname, data) {
                return Put(getDocUrl(collectionName), {
                    data: data
                }, id + "/." + fieldname);
            },

            /**
             * Deletes the document with the ID specified in the collection provided as parameter
             * @param collectionName - The name of the collection
             * @param id - The ID of the document to delete
             * @returns {*} - Promise containing no returned data
             */
            deleteDocument: function (collectionName, id) {
                return Delete(getDocUrl(collectionName), id);
            },

            /**
             * Grants permission to the document to a single user
             * @param collectionName - The name of the collection
             * @param id - The ID of the document
             * @param action - The grant you want to assign. One of: read, update, delete, all.
             * @param username - The username of the user to whom you want to assign the grant
             * @returns {*} - Promise containing no returned data
             */
            grantPermissionByUser: function (collectionName, id, action, username) {
                var url = getDocUrl(collectionName) + "/" + id + "/" + action + "/user/" + username;
                return Put(url, {}, null);
            },

            /**
             * Grants permission to the document to a single role
             * @param collectionName - The name of the collection
             * @param id - The ID of the document
             * @param action - The grant you want to assign. One of: read, update, delete, all.
             * @param role - The name of the role to whom you want to grant the permission
             *  One of: anonymous, registered, administrator, plus those defined by the administrator
             * @returns {*} - Promise containing no returned data
             */
            grantPermissionByRole: function (collectionName, id, action, role) {
                var url = getDocUrl(collectionName) + "/" + id + "/" + action + "/role/" + role;
                return Put(url, {}, null);
            },

            /**
             * Revokes permission on a document to the user
             * @param collectionName - The name of the collection
             * @param id - The ID of the document
             * @param action - The grant you want to revoke. One of: read, update, delete, all.
             * @param username - The username of the user to whom you want to revoke the grant
             * @returns {*} - Promise containing no returned data
             */
            revokePermissionByUser: function (collectionName, id, action, username) {
                var url = getDocUrl(collectionName) + "/" + id + "/" + action + "/role";
                return Delete(url, username);
            },

            /**
             * Revokes permission on a document to the role
             * @param collectionName - The name of the collection
             * @param id - The ID of the document
             * @param action - The grant you want to revoke. One of: read, update, delete, all.
             * @param role - The name of the role to whom you want to revoke the permission
             *  One of: anonymous, registered, administrator, plus those defined by the administrator
             * @returns {*} - Promise containing no returned data
             */
            revokePermissionByRole: function (collectionName, id, action, role) {
                var url = getDocUrl(collectionName) + "/" + id + "/" + action + "/role";
                return Delete(url, role);
            },

            /*======================================================*
                 LINKS
             *======================================================*/

            /**
             * Links allow to connect documents and files to each other.
             * To create a link you must provide the two documents you want to connect and the link name.
             * Since links have a direction, the first document will be the source node of the link and
             * the second one will be the destination node.
             * @param sourceId - The ID of the first document or file to link
             * @param destinationId - The ID of the second document or file to link
             * @param label - The link name. Can be any valid string
             * @returns {*} - Promise containing non-writable fields about the link
             */
            createLink: function (sourceId, destinationId, label) {
                return Post_Json("link/" + sourceId + "/" + label + "/" + destinationId, {})
            },

            /**
             * Get link by Id
             * @param id - Id of the link
             * @returns {*} - Promise containing non-writable fields about the link
             */
            getLinkById: function (id) {
                return Get("link", id, null);
            },

            /**
             * Get a single or multiple links using a query.
             * @param query - the query.  For example:
             *  where=in.name.toLowerCase() like 'john%' and label="customer"
             * @returns {*}- Promise containing an array of links
             */
            queryLink: function (query) {
                return Get("link", null, query);
            },

            /**
             * Deletes a link
             * @param id - Id of the link
             * @returns {*} - Promise containg no data, just "ok" if success
             */
            deleteLink: function (id) {
                return Delete("link", id);
            }


        };



        /*======================================================*
            HELPER FUNCTIONS - HTTP CALLS
         *======================================================*/

        /**
         * Use this method to post by passing data as a JSON
         * @param url - Which url to post to. Include only the API url, e.g "api/user"
         * @param data - Data the pass as a JSON object, e.g object name:"test",age:21
         * @returns {*} - A promise, with success containing the response data (not the code, the actual data)
         */
        function Post_Json(url, data) {
            var q = $q.defer();
            var HEADER = {
                headers: {
                    'X-BAASBOX-APPCODE': APPCODE,
                    'X-BB-SESSION': SESSION
                }
            }
            $http.post(BASEURL + url, data, HEADER).then(function (response) { // Success
                q.resolve(response.data.data);
            }, function (response) {
                console.log(response);
                q.reject(response);
            });
            return q.promise;
        }

        /**
         * Use this method to post by passing data as encoded URL, for example:
         *  -d "username=cesare" -d "password=password"
         * @param url - Which url to post to. Include only the API url, e.g "api/user"
         * @param data - Data the pass as a JSON object, e.g object name:"test",age:21
         * @returns {*} - A promise, with success containing the response data (not the code, the actual data)
         */
        function Post_Encoded(url, data) {
            var deferred = $q.defer();
            $http({
                method: 'POST',
                url: BASEURL + url,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                transformRequest: function (obj) {
                    var str = [];
                    for (var p in obj)
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
                data: data
            }).then(function (response) {
                deferred.resolve(response.data.data);
            }, function (response) {
                console.log(response);
                deferred.reject(response);
            });
            return deferred.promise;
        }

        /**
         * For all GETs. Providing no arg means its a get all.
         * @param url - Which url to post to. Include only the API url, e.g "api/user"
         * @param arg - What item to fetch, for example: "cesare"
         *  Note: The final url would translate to: "api/user/cesare"
         * @returns {*} - A promise, with success containing the response data (not the code, the actual data)
         */
        function Get(url, arg, query) {
            var q = $q.defer();
            var HEADER = {
                headers: {
                    'X-BAASBOX-APPCODE': APPCODE,
                    'X-BB-SESSION': SESSION
                }
            };
            var finalUrl = arg ? BASEURL + url + "/" + arg : BASEURL + url;
            if (query) finalUrl += "?" + encodeURIComponent(query);
            $http.get(finalUrl, HEADER).then(function (response) { // Success
                q.resolve(response.data.data);
            }, function (response) {
                console.log(response);
                q.reject(response);
            });
            return q.promise;
        }

        /**
         * For all PUTs with JSON data.
         * @param url - Which url to post to. Include only the API url, e.g "api/user"
         * @param data - Data the pass as a JSON object, e.g object name:"test",age:21
         * @returns {*} - A promise, with success containing the response data (not the code, the actual data)
         */
        function Put(url, data, arg) {
            var q = $q.defer();
            var HEADER = {
                headers: {
                    'X-BAASBOX-APPCODE': APPCODE,
                    'X-BB-SESSION': SESSION
                }
            };
            var finalUrl = arg ? BASEURL + url + "/" + arg : BASEURL + url;
            $http.put(finalUrl, data, HEADER).then(function (response) { // Success
                q.resolve(response.data.data);
            }, function (response) {
                console.log(response);
                q.reject(response);
            });
            return q.promise;
        }

        /**
         * For all DELETEs
         * @param url - Which url to call delete. Include only the API url, e.g "api/user"
         * @param id - Id of the said object to delete
         * @returns {*} - A promise, with success containing the response data (not the code, the actual data)
         */
        function Delete(url, id) {
            var q = $q.defer();
            var HEADER = {
                headers: {
                    'X-BAASBOX-APPCODE': APPCODE,
                    'X-BB-SESSION': SESSION
                }
            };
            $http.put(url + "/" + id, HEADER).then(function (response) {
                q.resolve("Deleted.");
            }, function (response) {
                console.log(response);
                q.reject(response);
            });
            return q.promise;
        }

        /*======================================================*
            HELPER FUNCTIONS - USER
         *======================================================*/

        /**
         * Stringify the user object
         * @param user - As in parent
         * @returns {*} - String
         */
        function makeNewUserData(user) {
            return JSON.stringify({
                username: user.username,
                password: user.password,
                visibleByTheUser: user.visibleByTheUser ? user.visibleByTheUser : {},
                visibleByFriends: user.visibleByFriends ? user.visibleByFriends : {},
                visibleByRegisteredUsers: user.visibleByRegisteredUsers ? user.visibleByRegisteredUsers : {},
                visibleByAnonymousUsers: user.visibleByAnonymousUsers ? user.visibleByAnonymousUsers : {}
            });
        }

        /**
         * Stringify the user object with only fields (no username and password)
         * @param user - As in parent
         * @returns {*} - String
         */
        function updateCurrentToString(user) {
            var toReturn = {};
            if (user.visibleByTheUser) toReturn.visibleByTheUser = user.visibleByTheUser;
            if (user.visibleByFriends) toReturn.visibleByFriends = user.visibleByFriends;
            if (user.visibleByRegisteredUsers) toReturn.visibleByRegisteredUsers = user.visibleByRegisteredUsers;
            if (user.visibleByAnonymousUsers) toReturn.visibleByAnonymousUsers = user.visibleByAnonymousUsers;
            return JSON.stringify(toReturn);
        }

        /*======================================================*
            HELPER FUNCTIONS - DOCUMENTS
         *======================================================*/

        /**
         * Generate a url for documents. Adds document/collectionName
         * @param collectionName - The name of the collection
         * @returns {string} - String of the URL
         */
        function getDocUrl(collectionName) {
            return "document/" + collectionName;
        }

}]);