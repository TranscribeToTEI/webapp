'use strict';

angular.module('transcript.service.user', ['ui.router'])

    .service('UserService', function($log, $http, $rootScope, $cookies, $state, $sce, $filter, flash, OAuth) {
        /*
         * Allowed profiles :
         * - short
         * - full
         *  */
        return {
            getUsers: function(profile) {
                return $http.get($rootScope.api+"/users?profile="+profile).
                    then(function(response) {
                        return response.data;
                    }, function errorCallback(response) {
                        $log.debug(response);
                        return response;
                    });
            },
            getUserByUsername: function(username, profile) {
                return $http.get(
                        $rootScope.api+"/users?username="+username+"&profile="+profile
                    ).then(function(response) {
                        return response.data;
                    }, function errorCallback(response) {
                        $log.debug(response);
                        return response;
                    });
            },
            getUser: function(id, profile) {
                return $http.get(
                        $rootScope.api+"/users/"+id+"?profile="+profile
                    ).then(function(response) {
                        return response.data;
                    }, function errorCallback(response) {
                        $log.debug(response);
                        return response;
                    });
            },
            getCurrent: function() {
                if($rootScope.user !== undefined) {return $rootScope.user;}
                else if($cookies.get('transcript_security_token_access') !== undefined) {
                    // Loading OAuth data:
                    $rootScope.oauth = JSON.parse($cookies.get('transcript_security_token_access'));

                    return $http.get($rootScope.api+"/users?token="+$rootScope.oauth.access_token).
                    then(function (response) {
                        $log.debug(response.data);
                        $rootScope.user = response.data;
                        return response.data;
                    }, function errorCallback(response) {
                        $log.debug(response);
                        return response;
                    });
                } else {
                    return null;
                }
            },
            confirm: function(token) {
                return $http.get($rootScope.api+"/users/confirmation/"+token).then(function(response) {
                        return {"code": 200, "message": response.data};
                    }, function errorCallback(response) {
                        return {"code": response.data.code, "message": response.data.message};
                    });
            },
            login: function(form, routing) {
                return OAuth.getAccessToken(form).
                    then(function(response) {
                        return $http.get($rootScope.api+"/users?token="+response.data.access_token)
                            .then(function (response) {
                                $rootScope.user = response.data;
                                $state.go(routing);
                                return response;
                            });
                    }, function errorCallback(response) {
                        $log.debug(response);
                        return response;
                    });
            },
            askReset: function(username) {
                return $http.get($rootScope.api+"/users/resetting/send/"+username)
                    .then(function (response) {
                        $log.debug(response.data);
                        return true;
                    }, function errorCallback(response) {
                        $log.debug(response);
                        return false;
                    });
            },
            sendReset: function(token, first, second) {
                return $http.post($rootScope.api+"/users/resetting/reset/"+token, {'fos_user_resetting_form': {'plainPassword': {'first': first, 'second': second}}})
                    .then(function (response) {
                        $log.debug(response.data);
                        return true;
                    }, function errorCallback(response) {
                        $log.debug(response);
                        return false;
                    });
            },
            changePassword: function(current, first, second) {
                return $http.post($rootScope.api+"/users/password/change", {'fos_user_change_password_form': {'current_password': current, 'plainPassword': {'first': first, 'second': second}}})
                    .then(function (response) {
                        $log.debug(response);
                        return response;
                    }, function errorCallback(response) {
                        $log.debug(response);
                        return response;
                    });
            },
            setRole: function(user, roles, action) {
                return $http.post($rootScope.api+"/users/"+user.id+"/roles", {roles: roles, id: user.id, action: action})
                    .then(function (response) {
                        $log.debug(response.data);
                        return true;
                    }, function errorCallback(response) {
                        $log.debug(response);
                        return false;
                    });
            }
        };
    })

;