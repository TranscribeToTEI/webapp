'use strict';

angular.module('transcript.system.error.404', ['ui.router'])
    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.error.404', {
            views: {
                "page" : {
                    templateUrl: '/webapp/app/System/Error/404/404.html',
                    controller: 'SystemError404Ctrl'
                }
            },
            url: '/404'
        })
    }])

    .controller('SystemError404Ctrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', function($log, $rootScope, $scope, $http, $sce, $state) {

    }])
;