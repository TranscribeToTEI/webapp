'use strict';

angular.module('transcript.app.user.change-password', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.user.changePassword', {
            views: {
                "page" : {
                    templateUrl: 'App/User/ChangePassword/ChangePassword.html',
                    controller: 'AppUserChangePasswordCtrl'
                }
            },
            url: '/change-password/{id}',
            ncyBreadcrumb: {
                parent: 'transcript.app.user.profile({id: user.id})',
                label: 'Modification du mot de passe'
            },
            tfMetaTags: {
                title: function(userEdit) {
                    return 'Mot de passe | '+ userEdit.name +' | Profil utilisateur';
                },
            },
            resolve: {
                userEdit: function(UserService, $transition$) {
                    return UserService.getUser($transition$.params().id);
                }
            }
        })
    }])

    .controller('AppUserChangePasswordCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'UserService', 'userEdit', 'flash', function($rootScope, $scope, $http, $sce, $state, UserService, userEdit, flash) {
        if($rootScope.user === undefined && $rootScope.user !== userEdit) {$state.go('transcript.app.security.login');}

        /* -- Breadcrumb management -------------------------------------------------------- */
        $scope.iUser = $rootScope.user;
        /* -- End : breadcrumb management -------------------------------------------------- */

        $scope.form = {
            currentPassword: "",
            password: {
                first: "",
                second: ""
            }
        };
        $scope.submit = {
            loading: false,
            success: false
        };

        /* Submit data */
        $scope.submit.action = function() {
            $scope.submit.loading = true;

            submit();
            function submit() {
                return UserService.changePassword($scope.form.currentPassword, $scope.form.password.first, $scope.form.password.second).
                then(function(response) {
                    if(response.status === 200 && response.data !== false) {
                        console.log(response);
                        $scope.submit.loading = false;
                        $scope.submit.success = true;
                        flash.success = "Votre mot de passe a bien été mis à jour, vous allez être redirigé dans quelques instants ...";
                        $state.go('transcript.app.user.profile', {id: $rootScope.user.id});
                    } else {
                        flash.error = "Mot de passe actuel incorrect";
                        $scope.submit.loading = false;
                    }
                }, function errorCallback(response) {
                    $scope.submit.loading = false;
                    console.log(response);
                });
            }
        };
    }])
;