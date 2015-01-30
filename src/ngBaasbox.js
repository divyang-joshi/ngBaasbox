/******************************************************************
    An AngularJS library for Baasbox (http://www.baasbox.com).
    Baasbox version 0.9.0
 ******************************************************************/

angular.module('ngBaasbox', [
    'ngBaasbox.api'
]);

angular.module('ngBaasbox.api', [])

    .factory('$baasbox', ['$q', '$http', function ($q, $http) {

        var BASEURL = "", APPCODE = 1234567890, SESSION = null, IOS_PUSH_TOKEN = null, ANDROID_PUSH_TOKEN = null,
            FACEBOOK_SOCIAL_TOKEN = null, GOOGLE_SOCIAL_TOKEN = null, FACEBOOK_SOCIAL_SECRET = null, GOOGLE_SOCIAL_SECRET = null;

        return {

            /**
             * Initialize baasbox. Options (an object)
             * @param options - An object, containing the following:
             *  url - Where all api call will be made. This is the base URL with the slash after the url included.
             *      As an example: www.myServer.com/ or 192.168.1.1:800/
             *  appCode - The application code you first ran the application with. The default is 1234567890.
             *  session - The session got after logging in (X-BB-SESSION). Default is null.
             *  iOSPushToken - The push notification token code for ios.
             *  androidPushToken - The push notification token code for android.
             *  facebookSocialToken - The social token for facebook.
             *  facebookSocialSecret - The social secret for facebook.
             *  googleSocialToken - The social token for google.
             *  googleSocialSecret - The social secret for google.
             *
             */
            init: function (options) {
                if (!options || !options.url) {
                    console.log("options requires url.");
                    return false;
                }
                BASEURL = options.url;
                APPCODE = options.appCode;
                SESSION = options.session;
                IOS_PUSH_TOKEN = options.iOSPushToken;
                ANDROID_PUSH_TOKEN = options.androidPushToken;
                FACEBOOK_SOCIAL_TOKEN = options.facebookSocialToken;
                FACEBOOK_SOCIAL_SECRET = options.facebookSocialSecret;
                GOOGLE_SOCIAL_TOKEN = options.googleSocialToken;
                GOOGLE_SOCIAL_SECRET = options.googleSocialSecret;
                return true;
            },

            //url, type, data, dataAsJson, headers, session
            /**
             * Make a custom call. As an example, if there is a new feature implemented
             * by baasbox, you can use this function instead of waiting for the sdk to update.
             * @param options - What you need to make the call:
             *  - url (required) : the link to the api, excluding the base url. api/admin/new.
             *  - method (required) : What call this is, eg 'PUT', 'POST', 'GET', 'DELETE' or anything else.
             *  - data (optional, default: {}) : Data to pass. Needs to be in a JSON format.
             *  - dataAsJson (optional, default: true) : Will the data be passed as a json or not. Example:
             *      true: -d "{"username" : "cesare", "password" : "password"}"
             *      false --> -d "username=cesare" -d "password=password" (app code will be attached, header wont)
             *  - headers (optional) : Attach additional headers.
             *      Note: Default header will be Content-type:application/json. So be sure to use appropriate headers
             *  - session (optional, default : value from init):
             * @returns {*} - Returns a promise of the response. Note: Does not return only data, rather everything including
             *  the response code, etc.
             */
            customCall: function(options) {

                var setup = {
                    method: options["type"],
                    url: BASEURL + "/" + options["url"],
                    headers: options["headers"] ? options["headers"] : {},
                    data: options["data"] ? options["data"] : {}
                };

                setup.headers["X-BB-SESSION"] = SESSION ? SESSION : options["session"];


                if (!options["dataAsJson"]) {
                    setup["transformRequest"] = function (obj) {
                        var str = [];
                        for (var p in obj)
                            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                        return str.join("&");
                    };
                    setup.data["appcode"] = APPCODE;
                }

                var q = $q.defer();
                $http(setup)
                    .then(function (response) {
                        q.resolve(response);
                    }, function (response) {
                        console.log(response);
                        q.reject(response);
                    });
                return q.promise;
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
                var passData = {username: username, password: password, appcode: APPCODE};
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
             * @returns {*} - Promise, which if a success, returns "ok"
             */
            logout: function () {
                var q = $q.defer();
                Post_Json("logout", "").then(function (response) {
                    SESSION = null;
                    q.resolve("ok");
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

            /**
             * To change the password of the logged in user.
             * After you call this API the authentication token is not valid anymore and should call login again.
             * @param oldPassword (required) - The old password
             * @param newPassword (required) - The new password
             * @returns {*} - Promise containing nothing if success.
             */
            changePassword: function (oldPassword, newPassword) {
                return Put("me/password", {old:oldPassword, new:newPassword}, null);
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
                return Put(getDocUrl(collectionName), {data: data}, id + "/." + fieldname);
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
            },

            /*======================================================*
             SOCIAL
             *======================================================*/

            /**
             * TODO: No connections (404) returns same error as other errors (401, 500, etc). Separate
             * Returns a JSON representation of the social network connected to the user
             * along with all the information retrieved at the moment of login/linking
             * @returns {*} - Promise with an array of connected social networks. See documentation for example.
             */
            getSocialConnections: function () {
                return Get("social", null, null);
            },

            /**
             * TODO: Not complete. Difference between login and link (Storing the X-BB-SESSION)
             * @param oauth_token - Might not be needed
             * @param oauth_secret -  Might not be needed
             * @returns {*}
             */
            loginWithGoogle: function (oauth_token, oauth_secret) {
                return Post_Encoded("social/google", generateOAuthData(oauth_token, oauth_secret))
            },

            /**
             * TODO: Not complete. Difference between login and link (Storing the X-BB-SESSION)
             * @param oauth_token -  Might not be needed
             * @param oauth_secret -  Might not be needed
             * @returns {*}
             */
            loginWithFacebook: function (oauth_token, oauth_secret) {
                return Post_Encoded("social/facebook", generateOAuthData(oauth_token, oauth_secret))
            },

            /**
             * TODO: Not complete. Difference between login and link (Storing the X-BB-SESSION)
             * @param oauth_token - Might not be needed
             * @param oauth_secret -  Might not be needed
             * @returns {*}
             */
            linkProfileToGoogle: function (oauth_token, oauth_secret) {
                return Put_Encoded("social", generateOAuthData(oauth_token, oauth_secret), 'google')
            },

            /**
             * TODO: Not complete. Difference between login and link (Storing the X-BB-SESSION)
             * @param oauth_token -  Might not be needed
             * @param oauth_secret -  Might not be needed
             * @returns {*}
             */
            linkProfileToFacebook: function (oauth_token, oauth_secret) {
                return Put_Encoded("social", generateOAuthData(oauth_token, oauth_secret), 'facebook')
            },

            /**
             * TODO: Complete top first
             * This method unlinks the current user account from a specified social network.
             * If the user was generated by a social network login and the specified social network is the only one
             * linked to the user, an error will be raised (as the user will not be available to connect anymore).
             * @returns {*}
             */
            unlinkFromGoogle: function () {
                return Delete('social/google', null);
            },

            /**
             * TODO: Complete top first
             * This method unlinks the current user account from a specified social network.
             * If the user was generated by a social network login and the specified social network is the only one
             * linked to the user, an error will be raised (as the user will not be available to connect anymore).
             * @returns {*}
             */
            unlinkFromFacebook: function () {
                return Delete('social/facebook', null);
            },

            /*======================================================*
             PUSH NOTIFICATIONS
             *======================================================*/

            /**
             * Enables a specific user (logged using an ios device) to receive push notifications.
             * @returns {*} - Promise, containing nothing if success
             */
            enablePushForIOS: function () {
                return Put('push/enable/ios', null, IOS_PUSH_TOKEN);
            },

            /**
             * Enables a specific user (logged using an android device) to receive push notifications.
             * @returns {*} - Promise, containing nothing if success
             */
            enablePushForAndroid: function () {
                return Put('push/enable/android', null, ANDROID_PUSH_TOKEN);
            },

            /**
             * Disable a specific user (logged using a specific device) to unreceive push notifications.
             * @returns {*} - Promise, containing nothing if success
             */
            disablePushNotifications: function () {
                return Put('push/disable', null, IOS_PUSH_TOKEN);
            },

            /**
             * Allows to send a push notification. This will be sent to every device,
             * registered with the respective app, on which users have enabled push notifications.
             * @param messageObject - A JSON object containing required the message, users, and others listed at:
             *  http://www.baasbox.com/documentation/#send-a-push-notification for all requirements
             * @returns {*}
             */
            sendPushNotification: function (messageObject) {
                return Post_Json("push/message", message);
            },

            /*======================================================*
             FILES & ASSETS
             - Files/Assets related APIs will be in a separate file.
             - Multiple versions containing multiple types
             *======================================================*/

            /*======================================================*
             ADMIN APIs
             - Need to move into another file to keep final minimal.
             - Also allows to have custom builds that way.
             *======================================================*/

            /**
             * Returns a JSON representing the current configuration
             * @returns {*} - Promise containing the JSON dump
             */
            adminGetCurrentSettings: function() {
                return Get("admin/configuration", "dump.json", null);
            },

            /**
             * Returns a JSON representing a section of the password recovery configuration
             * @returns {*} - A promise containing the JSON object
             */
            adminGetPassRecoverySettings: function() {
                return Get("admin/configuration", "PasswordRecovery", null);
            },

            /**
             * Returns a JSON representing a section of the application configuration
             * @returns {*} - A promise containing the JSON object
             */
            adminGetApplicationSettings: function() {
                return Get("admin/configuration", "Application", null);
            },

            /**
             * Returns a JSON representing a section of the push notifications configuration
             * @returns {*} - A promise containing the JSON object
             */
            adminGetPushSettings: function() {
                return Get("admin/configuration", "Push", null);
            },

            /**
             * Returns a JSON representing a section of the images configuration
             * @returns {*} - A promise containing the JSON object
             */
            adminGetImagesSettings: function() {
                return Get("admin/configuration", "Images", null);
            },

            /**
             * Updates a specific value in the password recovery settings.
             * @param key - The key whose value to update
             * @param value - The value
             * @returns {*} - A promise containing nothing on success
             */
            adminUpdatePassRecoverySetting: function(key, value) {
                return Put("admin/configuration/PasswordRecovery", null, key + "/" + value);
            },

            /**
             * Updates a specific value in the application settings.
             * @param key - The key whose value to update
             * @param value - The value
             * @returns {*} - A promise containing nothing on success
             */
            adminUpdateApplicationSetting: function(key, value) {
                return Put("admin/configuration/Application", null, key + "/" + value);
            },

            /**
             * Updates a specific value in the push notifications settings.
             * @param key - The key whose value to update
             * @param value - The value
             * @returns {*} - A promise containing nothing on success
             */
            adminUpdatePushSetting: function(key, value) {
                return Put("admin/configuration/Push", null, key + "/" + value);
            },

            /**
             * Updates a specific value in the images settings.
             * @param key - The key whose value to update
             * @param value - The value
             * @returns {*} - A promise containing nothing on success
             */
            adminUpdateImagesSetting: function(key, value) {
                return Put("admin/configuration/Images", null, key + "/" + value);
            },

            /**
             * Get the predefined groups are all prefixed with 'baasbox.',
             * and cover all the endpoints except for the administrative ones that cannot be turned off.
             * The list of all endpoints is at:
             *  http://www.baasbox.com/documentation/#enable-an-endpoint-group
             * @returns {*} - A promise containing a list of details about all the endpoints
             */
            adminGetEndPoints: function() {
                return Get("admin/endpoints", null, null);
            },

            /**
             * Returns details about a group. Useful to know if a specific group of APIs is enabled or not.
             * @param groupName - The name of the group of endpoints. The list of all endpoints is at:
             *  http://www.baasbox.com/documentation/#enable-an-endpoint-group
             * @returns {*} - A promise containing details about the endpoint
             */
            adminGetSingleEndPoint: function(groupName) {
                return Get("admin/endpoints", groupName, null);
            },

            /**
             * Enable a group of endpoints
             * @param groupName - The name of the group of endpoints. The list of all endpoints is at:
             *  http://www.baasbox.com/documentation/#enable-an-endpoint-group
             * @returns {*} - A promise containing nothing on success
             */
            adminEnableEndPoint: function(groupName) {
                return Put("admin/endpoints/" + groupName + "/enabled", null, null);
            },

            /**
             * TODO: Handle these 403 errors
             * Disables a group of endpoints. Calls to endpoints belonging to this group will return an error 403.
             * @param groupName - The name of the group of endpoints. The list of all endpoints is at:
             *  http://www.baasbox.com/documentation/#enable-an-endpoint-group
             * @returns {*} - A promise containing nothing on success
             */
            adminDisableEndPoint: function(groupName) {
                return Delete("admin/endpoints/" + groupName + "/enabled", null);
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
            var HEADER = {headers: {'X-BAASBOX-APPCODE': APPCODE, 'X-BB-SESSION': SESSION}}
            $http.post(BASEURL + "/" + url, data, HEADER).then(function (response) { // Success
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
            var q = $q.defer();
            $http({
                method: 'POST',
                url: BASEURL + "/" + url,
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
            })
                .then(function (response) {
                    q.resolve(response.data.data);
                }, function (response) {
                    console.log(response);
                    q.reject(response);
                });
            return q.promise;
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
            var HEADER = {headers: {'X-BAASBOX-APPCODE': APPCODE, 'X-BB-SESSION': SESSION}};
            var finalUrl = arg ? BASEURL + "/" + url + "/" + arg : BASEURL + "/" + url;
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
            var HEADER = {headers: {'X-BAASBOX-APPCODE': APPCODE, 'X-BB-SESSION': SESSION}};
            var finalUrl = arg ? BASEURL + "/" + url + "/" + arg : BASEURL + "/" + url;
            $http.put(finalUrl, data ? data : {}, HEADER).then(function (response) { // Success
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
         * @param arg - Argument to pass
         * @returns {*} - A promise, with success containing the response data (not the code, the actual data)
         */
        function Put_Encoded(url, data, arg) {
            var q = $q.defer();
            var finalUrl = arg ? BASEURL + "/" + url + "/" + arg : BASEURL + "/" + url;
            $http({
                method: 'PUT',
                url: finalUrl,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-BAASBOX-APPCODE': APPCODE,
                    'X-BB-SESSION': SESSION
                },
                transformRequest: function (obj) {
                    var str = [];
                    for (var p in obj)
                        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
                data: data
            }).then(function (response) {
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
            var HEADER = {headers: {'X-BAASBOX-APPCODE': APPCODE, 'X-BB-SESSION': SESSION}};
            var finalUrl = id ? BASEURL + "/" + url + "/" + id : BASEURL + "/" + url;
            $http.delete(finalUrl, HEADER).then(function (response) {
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

        /*======================================================*
         HELPER FUNCTIONS - SOCIAL
         *======================================================*/
        function generateOAuthData(oauth_token, oauth_secret) {
            return {
                oauth_token: oauth_token,
                oauth_secret: oauth_secret
            }
        }

    }]);
