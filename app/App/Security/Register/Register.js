'use strict';

angular.module('transcript.app.security.register', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.security.register', {
            views: {
                "page" : {
                    templateUrl: 'App/Security/Register/Register.html',
                        controller: 'AppSecurityRegisterCtrl'
                }
            },
            url: '/register',
            ncyBreadcrumb: {
                parent: 'transcript.app.home',
                label: 'Inscription'
            },
            tfMetaTags: {
                title: 'Inscription',
            },
            requireLogin: false
        })
    }])

    .controller('AppSecurityRegisterCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'flash', function($rootScope, $scope, $http, $sce, $state, flash) {
        if($rootScope.user !== undefined && $rootScope.user !== null) {
            $state.go('transcript.app.user.profile', {id: $rootScope.user.id});
        }

        $scope.page = {};
        $scope.form = {
            name: null,
            email: null,
            password: {
                plain: null,
                confirmation: null
            },
            errors: []
        };
        $scope.submit = {
            loading: false,
            success: false
        };

        /* Register data */
        $scope.submit.action = function() {
            $scope.submit.loading = true;
            $scope.form.errors = [];
            $http.post($rootScope.api+"/users",
                {
                    'fos_user_registration_form' : {
                        'name': $scope.form.name,
                        'email': $scope.form.email,
                        'plainPassword': {
                            'first': $scope.form.password.plain,
                            'second': $scope.form.password.confirmation
                        }
                    }
                })
                .then(function (response) {
                    $scope.submit.loading = false;
                    $scope.submit.success = true;
                    flash.success = "Votre compte a bien été créé. Vous allez être redirigé dans quelques instants...";
                    $state.go('transcript.app.security.check');
                }, function errorCallback(response) {
                    console.log(response);
                    $scope.submit.loading = false;
                    flash.error = "<ul>";
                    for(let field in response.data.errors.children) {
                        for(let error in response.data.errors.children[field]) {
                            if(error === "errors") {
                                flash.error += "<li><strong>"+field+"</strong> : "+response.data.errors.children[field][error]+"</li>";
                            }
                        }
                    }
                    flash.error += "</ul>";
                });
        };
    }])
;