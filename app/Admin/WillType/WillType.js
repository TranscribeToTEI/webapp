'use strict';

angular.module('transcript.admin.will-type', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.admin.will-type', {
            abstract: true,
            views: {
                "page" : {
                    template: '<div ui-view="page"></div>',
                    controller: 'AdminWillTypeCtrl'
                }
            },
            url: '/will-type'
        })
    }])

    .controller('AdminWillTypeCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', 'tfMetaTags', function($log, $rootScope, $scope, $http, $sce, $state, tfMetaTags) {
        tfMetaTags.setTitleSuffix(tfMetaTags.getTitleSuffix());
    }])
;