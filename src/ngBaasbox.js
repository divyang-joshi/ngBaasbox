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

            /**
             * Registers a new user
             * @param user - A JSON object representing a user. An example:
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
             * @returns {*} A promise, with success containing the data (contains user, signUpDate, X-BB-SESSION).
             *  See http://www.baasbox.com/documentation/?shell#sign-up
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
             *  See http://www.baasbox.com/documentation/?shell#login
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

            me: function () {
                console.log("Not implemented yet.")
            },

            updateProfile: function () {
                console.log("Not implemented yet.")
            },

            changePassword: function () {
                console.log("Not implemented yet.")
            },

            forgotPassword: function () {
                console.log("Not implemented yet.")
            },

            getUserDetails: function (username) {
                console.log("Not implemented yet.")
            },

            getAllUsers: function (query) {
                console.log("Not implemented yet.")
            }

            // TODO: Implement -> suspend, activate, change username



        };

        /*======================================================*
            HELPER FUNCTIONS - HTTP CALLS
         *======================================================*/

        /**
         * Use this method to post by passing data as a JSON
         * @param url - Which url to post to. Include only the API url, e.g "api/user"
         * @param data - Data the pass as a JSON object, e.g {name:"test",age:21}
         * @returns {*} - A promise, with success containing the response data (not the code, the actual data)
         */
        function Post_Json(url, data) {
            var deferred = $q.defer();
            var HEADER = {
                headers: {
                    'X-BAASBOX-APPCODE': APPCODE,
                    'X-BB-SESSION': User.getSession()
                }
            }
            $http.post(BASEURL + url, data, HEADER).then(function (response) { // Success
                deferred.resolve(response.data.data);
            }, function (response) {
                console.log(response);
                deferred.reject(response);
            });
            return deferred.promise;
        }

        /**
         * Use this method to post by passing data as encoded URL, for example:
         *  -d "username=cesare" -d "password=password"
         * @param url - Which url to post to. Include only the API url, e.g "api/user"
         * @param data - Data the pass as a JSON object, e.g {name:"test",age:21}
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

}]);