'use strict';

angular.module('transcript.app.hosting-organization', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.hosting-organization', {
            abstract: true,
            views: {
                "page" : {
                    template: '<div ui-view="page"></div>',
                    controller: 'AppHostingOrganizationCtrl'
                }
            },
            url: '/institutions'
        })
    }])


    .controller('AppHostingOrganizationCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', 'tfMetaTags', function($log, $rootScope, $scope, $http, $sce, $state, tfMetaTags) {
        tfMetaTags.setTitleSuffix(tfMetaTags.getTitleSuffix());
    }])
;