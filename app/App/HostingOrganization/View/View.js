'use strict';

angular.module('transcript.app.hosting-organization.view', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('transcript.app.hosting-organization.view', {
                views: {
                    "page" : {
                        templateUrl: 'App/HostingOrganization/View/View.html',
                        controller: 'AppHostingOrganizationViewCtrl'
                    }
                },
                url: '/:id',
                ncyBreadcrumb: {
                    parent: 'transcript.app.hosting-organization.list',
                    label: '{{ organization.name }}'
                },
                tfMetaTags: {
                    title: '{{ organization.name }} | Institution',
                },
                resolve: {
                    organization: function(HostingOrganizationService, $transition$) {
                        return HostingOrganizationService.getOrganization($transition$.params().id);
                    }
                }
            })
    }])

    .controller('AppHostingOrganizationViewCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', '$timeout', 'organization', function($rootScope, $scope, $http, $sce, $state, $timeout, organization) {
        $scope.organization = organization;
    }])
;