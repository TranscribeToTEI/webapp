'use strict';

angular.module('transcript.app.security.login', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.security.login', {
            views: {
                "page" : {
                    templateUrl: 'App/Security/Login/Login.html',
                    controller: 'AppSecurityLoginCtrl'
                }
            },
            url: '/login',
            tfMetaTags: {
                title: 'Connexion',
            },
            ncyBreadcrumb: {
                parent: 'transcript.app.home',
                label: 'Connexion'
            }
        })
    }])

    .controller('AppSecurityLoginCtrl', ['$rootScope', '$scope', '$http', '$sce', '$state', '$cookies', 'UserService', 'flash', function($rootScope, $scope, $http, $sce, $state, $cookies, UserService, flash) {
        if($rootScope.user !== undefined && $rootScope.user !== null) {
            $state.go('transcript.app.user.profile', {id: $rootScope.user.id});
        }

        $scope.form = {
            username: null,
            password: null
        };
        $scope.errors = [];
        $scope.submit = {
            loading: false,
            success: false
        };

        /* Loading data */
        $scope.submit.action = function() {
            $scope.submit.loading = true;

            login();
            function login() {
                return UserService.login($scope.form, "transcript.app.home").
                then(function(response) {
                    console.log(response);
                    $scope.submit.loading = false;
                    if(response.status === 200) {
                        $scope.submit.success = true;
                        flash.success = "Vous allez être redirigé dans quelques instants ...";
                    } else if(response.status === 400) {
                        flash.error = response.data.error_description;
                        console.log(flash);
                    }
                }, function errorCallback(response) {
                    $scope.submit.loading = false;
                    console.log(response);
                });
            }
        };
    }])
;