'use strict';

angular.module('transcript.app.security.check', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.security.check', {
            views: {
                "page" : {
                    templateUrl: '/webapp/app/App/Security/Check/Check.html',
                        controller: 'AppSecurityCheckCtrl'
                }
            },
            url: '/check',
            tfMetaTags: {
                title: 'Vérification d\'inscription',
            }
        })
    }])

    .controller('AppSecurityCheckCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', function($log, $rootScope, $scope, $http, $sce, $state) {
        $scope.page = {};

        if($rootScope.user !== undefined && $rootScope.user !== null) {
            $state.go('transcript.app.user.profile', {id: $rootScope.user.id});
        }
    }])
;