'use strict';

angular.module('transcript.app.hosting-organization.list', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.hosting-organization.list', {
            views: {
                "page" : {
                    templateUrl: 'App/HostingOrganization/List/List.html',
                    controller: 'AppHostingOrganizationListCtrl'
                }
            },
            url: '/list',
            ncyBreadcrumb: {
                parent: 'transcript.app.home',
                label: 'Liste des institutions'
            },
            tfMetaTags: {
                title: 'Liste | Institutions',
            },
            resolve: {
                organizations: function(HostingOrganizationService) {
                    return HostingOrganizationService.getOrganizations();
                }
            }
        })
    }])

    .controller('AppHostingOrganizationListCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', 'organizations', function($log, $rootScope, $scope, $http, $sce, $state, organizations) {
        $scope.organizations = organizations;
    }])
;