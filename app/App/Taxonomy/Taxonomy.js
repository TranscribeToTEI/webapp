'use strict';

angular.module('transcript.app.taxonomy', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.taxonomy', {
            abstract: true,
            views: {
                "page" : {
                    template: '<div ui-view="page"></div>',
                    controller: 'AppTaxonomyCtrl'
                }
            },
            url: '/taxonomy'
        })
    }])

    .controller('AppTaxonomyCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', 'tfMetaTags', function($log, $rootScope, $scope, $http, $sce, $state, tfMetaTags) {
        tfMetaTags.setTitleSuffix(tfMetaTags.getTitleSuffix());
    }])
;

