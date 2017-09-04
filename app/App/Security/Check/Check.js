'use strict';

angular.module('transcript.app.security.check', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.security.check', {
            views: {
                "page" : {
                    templateUrl: 'App/Security/Check/Check.html',
                        controller: 'AppSecurityCheckCtrl'
                }
            },
            url: '/check'
        })
    }])

    .controller('AppSecurityCheckCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', function($rootScope, $scope, $http, $sce, $state) {
        $scope.page = {};
    }])
;