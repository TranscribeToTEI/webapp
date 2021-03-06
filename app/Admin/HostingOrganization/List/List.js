'use strict';

angular.module('transcript.admin.hosting-organization.list', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.admin.hosting-organization.list', {
            views: {
                "page" : {
                    templateUrl: '/webapp/app/Admin/HostingOrganization/List/List.html',
                    controller: 'AdminHostingOrganizationListCtrl'
                }
            },
            url: '/list',
            ncyBreadcrumb: {
                parent: 'transcript.admin.home',
                label: 'Liste des organisations de conservation'
            },
            tfMetaTags: {
                title: 'Liste | Organisations de conservation | Administration',
            },
            resolve: {
                organizations: function(HostingOrganizationService) {
                    return HostingOrganizationService.getOrganizations();
                }
            }
        })
    }])

    .controller('AdminHostingOrganizationListCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', 'organizations', function($log, $rootScope, $scope, $http, $sce, $state, organizations) {
        $scope.organizations = organizations;
    }])
;