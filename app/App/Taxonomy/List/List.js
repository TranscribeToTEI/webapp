'use strict';

angular.module('transcript.app.taxonomy.list', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.taxonomy.list', {
            views: {
                "page" : {
                    templateUrl: 'App/Taxonomy/List/List.html',
                    controller: 'AppTaxonomyListCtrl'
                }
            },
            url: '/{type}',
            ncyBreadcrumb: {
                parent: 'transcript.app.taxonomy.home',
                label: 'Liste des {{ pluralType }}'
            },
            tfMetaTags: {
                title: function(type, filter) {
                    return 'Liste des '+filter('taxonomyName')(type, 'plural')+' | Notices d\'autorité';
                },
            },
            resolve: {
                type: function($transition$) {
                    return $transition$.params().type;
                },
                filter: function($filter) {
                    return $filter;
                },
                entities: function(TaxonomyService, $transition$) {
                    return TaxonomyService.getTaxonomyEntities($transition$.params().type);
                }
            }
        })
    }])

    .controller('AppTaxonomyListCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', 'entities', '$transition$', '$filter', function($log, $rootScope, $scope, $http, $sce, $state, entities, $transition$, $filter) {
        $scope.entity = {
            id: null,
            dataType: $transition$.params().type
        };
        $scope.entities = entities;
        $log.log($scope.entities);

        $scope.pluralType = $filter('taxonomyName')($scope.entity.dataType, 'plural');

        /* Place names management ----------------------------------------------------------------------------------- */
        if($scope.entity.dataType === 'places') {
            for(let iEntity in $scope.entities) {
                if($scope.entities[iEntity].names.length > 0) {
                    $scope.entities[iEntity].name = $scope.entities[iEntity].names[0].name;
                }
            }
        }
        /* End: Place names management ------------------------------------------------------------------------------ */

        /* Entities sort management --------------------------------------------------------------------------------- */
        if($scope.entity.dataType === 'places') {
            $scope.entities = $filter('orderBy')($scope.entities, 'name');
        } else if($scope.entity.dataType === 'testators') {
            $scope.entities = $filter('orderBy')($scope.entities, 'surname');
        } else if($scope.entity.dataType === 'military-units') {
            $scope.entities = $filter('orderBy')($scope.entities, 'name');
        }
        /* End: Entities sort management ---------------------------------------------------------------------------- */


        /* ---------------------------------------------------------------------------------------------------------- */
        /* Facets system */
        /* ---------------------------------------------------------------------------------------------------------- */
        $scope.fieldSearch = null;
        $scope.valueSearch = null;
        $scope.$watch('[fieldSearch,valueSearch]', function() {
            if($scope.fieldSearch && $scope.valueSearch) {
                let arraySearch = {};
                if($scope.fieldSearch === 'yearOfDeath') {
                    arraySearch = {yearOfDeath: $scope.valueSearch}
                } else if($scope.fieldSearch === 'placeOfDeathNormalized') {
                    arraySearch = {placeOfDeathNormalized: {names: {name: $scope.valueSearch}}}
                } else if($scope.fieldSearch === 'profession') {
                    arraySearch = {profession: $scope.valueSearch}
                } else if($scope.fieldSearch === 'addressCity') {
                    arraySearch = {addressCity: {names: {name: $scope.valueSearch}}}
                } else if($scope.fieldSearch === 'yearOfBirth') {
                    arraySearch = {yearOfBirth: $scope.valueSearch}
                } else if($scope.fieldSearch === 'placeOfBirthNormalized') {
                    arraySearch = {placeOfBirthNormalized: {names: {name: $scope.valueSearch}}}
                } else if($scope.fieldSearch === 'frenchDepartements') {
                    arraySearch = {frenchDepartements: {name: $scope.valueSearch}}
                } else if($scope.fieldSearch === 'frenchRegions') {
                    arraySearch = {frenchRegions: {name: $scope.valueSearch}}
                } else if($scope.fieldSearch === 'countries') {
                    arraySearch = {countries: {name: $scope.valueSearch}}
                } else if($scope.fieldSearch === 'geonamesId') {
                    arraySearch = {geonamesId: $scope.valueSearch}
                }

                $log.log(arraySearch);
                $scope.results = $filter('filter')($scope.entities, arraySearch);
            } else {
                $scope.results = $scope.entities;
            }
            $log.log($scope.results);
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
            $log.log('Page changed to: ' + $scope.currentPage);
        };
        /* ---------------------------------------------------------------------------------------------------------- */
    }])
;