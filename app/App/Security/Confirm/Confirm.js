'use strict';

angular.module('transcript.app.security.confirm', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.security.confirm', {
            views: {
                "page" : {
                    templateUrl: '/webapp/app/App/Security/Confirm/Confirm.html',
                        controller: 'AppSecurityConfirmCtrl'
                }
            },
            url: '/confirm/{token}',
            tfMetaTags: {
                title: 'Confirmation d\'inscription',
            },
            resolve: {
                confirmation: function(UserService, $transition$) {
                    return UserService.confirm($transition$.params().token);
                }
            }
        })
    }])

    .controller('AppSecurityConfirmCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', 'confirmation', function($log, $rootScope, $scope, $http, $sce, $state, confirmation) {
        $scope.status = confirmation.code;

        if($rootScope.user !== undefined && $rootScope.user !== null) {
            $state.go('transcript.app.user.profile', {id: $rootScope.user.id});
        }
    }])
;