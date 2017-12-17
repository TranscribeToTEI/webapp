'use strict';

angular.module('transcript.app.security.resetting.reset', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.security.resetting.reset', {
            views: {
                "page" : {
                    templateUrl: 'App/Security/Resetting/Reset/Reset.html',
                        controller: 'AppSecurityResettingResetCtrl'
                }
            },
            url: '/form/{token}',
            ncyBreadcrumb: {
                parent: 'transcript.app.security.login',
                label: 'Mot de passe oublié'
            },
            tfMetaTags: {
                title: 'Réinitialisation | Réinitialisation du mot de passe',
            }
        })
    }])

    .controller('AppSecurityResettingResetCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', 'flash', '$transition$', 'UserService', function($log, $rootScope, $scope, $http, $sce, $state, flash, $transition$, UserService) {
        $scope.form = {
            password: {
                plain: null,
                confirmation: null
            }
        };
        $scope.submit = {
            loading: false,
            success: false
        };

        $scope.submit.action = function() {
            $scope.submit.loading = true;

            if($scope.form.password.plain === $scope.form.password.confirmation) {
                reset();
            } else {
                flash.error = "Les mots de passe doivent être identiques !";
            }

            function reset() {
                return UserService.sendReset($transition$.params().token, $scope.form.password.plain,$scope.form.password.confirmation).
                then(function(data) {
                    $scope.submit.loading = false;
                    $scope.submit.success = true;
                    flash.success = "Votre mot de passe a bien été réinitialisé.";
                }, function errorCallback(response) {
                    $scope.submit.loading = false;
                    $log.debug(response);
                    flash.error = response;

                });
            }
        };
    }])
;