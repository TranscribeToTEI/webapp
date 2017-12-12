'use strict';

angular.module('transcript.system.error', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.error', {
            abstract: true,
            views: {
                "page" : {
                    template: '<div ui-view="page"></div>',
                    controller: 'ErrorCtrl'
                }
            },
            url: '/error'
        })
    }])

    .controller('ErrorCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', 'user', 'appPreference', function($log, $rootScope, $scope, $http, $sce, $state, user, appPreference) {

    }])
;