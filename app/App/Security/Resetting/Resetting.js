'use strict';

angular.module('transcript.app.security.resetting', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.security.resetting', {
            abstract: true,
            views: {
                "page" : {
                    template: '<div ui-view="page"></div>',
                    controller: 'AppSecurityResettingCtrl'
                }
            },
            url: '/resetting'
        })
    }])

    .controller('AppSecurityResettingCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', 'tfMetaTags', function($log, $rootScope, $scope, $http, $sce, $state, tfMetaTags) {
        tfMetaTags.setTitleSuffix(tfMetaTags.getTitleSuffix());

        if($rootScope.user !== undefined && $rootScope.user !== null) {
            $state.go('transcript.app.user.profile', {id: $rootScope.user.id});
        }
    }])
;