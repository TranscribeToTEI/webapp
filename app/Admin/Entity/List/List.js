'use strict';

angular.module('transcript.admin.entity.list', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.admin.entity.list', {
            views: {
                "page" : {
                    templateUrl: 'Admin/Entity/List/List.html',
                    controller: 'AdminEntityListCtrl'
                }
            },
            url: '/list',
            ncyBreadcrumb: {
                parent: 'transcript.admin.home',
                label: 'Liste des entités'
            },
            tfMetaTags: {
                title: 'Liste | Entités | Administration',
            },
            resolve: {
                entities: function(EntityService) {
                    return EntityService.getEntities();
                }
            }
        })
    }])

    .controller('AdminEntityListCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$filter', 'entities', function($log, $rootScope, $scope, $http, $sce, $state, $filter, entities) {
        $scope.entities = entities;
        $log.debug($scope.entities);
        $scope.entitiesSorting = "willNumber";
        $scope.fieldSearch = null;
        $scope.valueSearch = null;

        /* ---------------------------------------------------------------------------------------------------------- */
        /* Facets system */
        /* ---------------------------------------------------------------------------------------------------------- */
        $scope.$watch('[fieldSearch,valueSearch]', function() {
            if($scope.fieldSearch && $scope.valueSearch) {
                let arraySearch = {};
                if($scope.fieldSearch === 'will.callNumber') {
                    arraySearch = {will: {callNumber: $scope.valueSearch}}
                } else if($scope.fieldSearch === 'willNumber') {
                    arraySearch = {willNumber: $scope.valueSearch}
                } else if($scope.fieldSearch === 'will.notaryNumber') {
                    arraySearch = {will: {notaryNumber: $scope.valueSearch}}
                } else if($scope.fieldSearch === 'will.crpcenNumber') {
                    arraySearch = {will: {crpcenNumber: $scope.valueSearch}}
                } else if($scope.fieldSearch === 'will.testator.name') {
                    arraySearch = {will: {testator: {name: $scope.valueSearch}}}
                } else if($scope.fieldSearch === 'will.hostingOrganization.name') {
                    arraySearch = {will: {hostingOrganization: {name: $scope.valueSearch}}}
                } else if($scope.fieldSearch === 'will.willWritingDateString') {
                    arraySearch = {will: {willWritingDateString: $scope.valueSearch}}
                } else if($scope.fieldSearch === 'will.minuteDateString') {
                    arraySearch = {will: {minuteDateString: $scope.valueSearch}}
                } else if($scope.fieldSearch === 'will.willWritingPlaceString') {
                    arraySearch = {will: {willWritingPlaceString: $scope.valueSearch}}
                } else if($scope.fieldSearch === 'will.willType.name') {
                    arraySearch = {will: {willType: {name: $scope.valueSearch}}}
                }

                $log.debug(arraySearch);
                $scope.results = $filter('filter')($scope.entities, arraySearch);
            } else {
                $scope.results = $scope.entities;
            }
            $log.debug($scope.results);
        });
        /* ---------------------------------------------------------------------------------------------------------- */

        /* ---------------------------------------------------------------------------------------------------------- */
        /* Pagination system */
        /* ---------------------------------------------------------------------------------------------------------- */
        $scope.itemsPerPage = 100;
        $scope.$watch('results', function() {
            $scope.totalItems = $scope.results.length;
            $scope.currentPage = 1;
        });

        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
        };

        $scope.pageChanged = function() {
            $log.debug('Page changed to: ' + $scope.currentPage);
        };
        /* ---------------------------------------------------------------------------------------------------------- */
    }])
;