'use strict';

angular.module('transcript.admin.user.view', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.admin.user.view', {
            views: {
                "page" : {
                    templateUrl: 'Admin/User/View/View.html',
                    controller: 'AdminUserViewCtrl'
                }
            },
            url: '/{id}',
            ncyBreadcrumb: {
                parent: 'transcript.admin.user.list',
                label: 'Modification de {{ iUser.name }}'
            },
            tfMetaTags: {
                title: 'Modification de {{ iUser.name }} | Utilisateurs | Administration',
            },
            resolve: {
                user: function(UserService, $transition$) {
                    return UserService.getUser($transition$.params().id);
                }
            }
        })
    }])

    .controller('AdminUserViewCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', 'user', 'flash', '$timeout', function($log, $rootScope, $scope, $http, $sce, $state, user, flash, $timeout) {
        $scope.iUser = user;
        $scope.roles = {
            submit: {
                loading: false,
                success: false
            }
        };
        $scope.remove = {
            loading: false,
            success: false
        };

        /* Edit User Roles ------------------------------------------------------------------------------------------ */
        $scope.roles.submit.action = function() {
            $scope.roles.submit.loading = true;
            let form = {
                id: $scope.iUser.id,
                roles: $scope.iUser.roles,
                action: "set"
            };
            $log.log(form);

            $http.post($rootScope.api+'/users/'+$scope.iUser.id+"/roles", form).
            then(function (response) {
                $log.log(response.data);
                flash.success = "Les rôles ont bien été mis à jour";
                $scope.roles.submit.loading = false;
                $scope.roles.submit.success = true;
                $timeout(function() {
                    $scope.roles.submit.success = false;
                }, 5000);
            }, function errorCallback(response) {
                $scope.roles.submit.loading = false;
                if(response.data.code === 400) {
                    flash.error = "<ul>";
                    for(let field in response.data.errors.children) {
                        for(let error in response.data.errors.children[field]) {
                            if(error === "errors") {
                                flash.error += "<li><strong>"+field+"</strong> : "+response.data.errors.children[field][error]+"</li>";
                            }
                        }
                    }
                    flash.error += "</ul>";

                }
                $log.log(response);
            });
        };
        /* End: Edit User Roles ------------------------------------------------------------------------------------- */

        /* Remove User ---------------------------------------------------------------------------------------------- */
        $scope.remove.action = function() {
            $scope.remove.loading = true;

            $http.delete($rootScope.api+'/users/'+$scope.iUser.id).
            then(function (response) {
                $log.log(response.data);
                flash.success = "Vous allez être redirigé dans quelques instants ...";
                $scope.remove.loading = false;
                $scope.remove.success = true;
                $state.go('transcript.admin.user.list');
            }, function errorCallback(response) {
                $scope.remove.loading = false;
                if(response.data.code === 400) {
                    flash.error = "<ul>";
                    for(let field in response.data.errors.children) {
                        for(let error in response.data.errors.children[field]) {
                            if(error === "errors") {
                                flash.error += "<li><strong>"+field+"</strong> : "+response.data.errors.children[field][error]+"</li>";
                            }
                        }
                    }
                    flash.error += "</ul>";

                }
                $log.log(response);
            });
        };
        /* End: Remove User ----------------------------------------------------------------------------------------- */
    }])
;