'use strict';

angular.module('transcript.admin.hosting-organization', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.admin.hosting-organization', {
            abstract: true,
            views: {
                "page" : {
                    template: '<div ui-view="page"></div>',
                    controller: 'AdminHostingOrganizationCtrl'
                }
            },
            url: '/organisations'
        })
    }])


    .controller('AdminHostingOrganizationCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', 'tfMetaTags', function($log, $rootScope, $scope, $http, $sce, $state, tfMetaTags) {
        tfMetaTags.setTitleSuffix(tfMetaTags.getTitleSuffix());
    }])
;