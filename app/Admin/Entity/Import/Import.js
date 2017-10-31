'use strict';

angular.module('transcript.admin.entity.import', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.admin.entity.import', {
            views: {
                "page" : {
                    templateUrl: 'Admin/Entity/Import/Import.html',
                    controller: 'AdminEntityImportCtrl'
                }
            },
            url: '/import',
            ncyBreadcrumb: {
                parent: 'transcript.admin.entity.list',
                label: 'Importation'
            },
            tfMetaTags: {
                title: 'Importation',
            },
            resolve: {
                testators: function(TaxonomyService) {
                    return TaxonomyService.getTaxonomyEntities('testators');
                },
                places: function(TaxonomyService) {
                    return TaxonomyService.getTaxonomyEntities('places');
                },
                militaryUnits: function(TaxonomyService) {
                    return TaxonomyService.getTaxonomyEntities('military-units');
                }
            }
        })
    }])

    .controller('AdminEntityImportCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', '$filter', 'testators', 'places', 'militaryUnits', 'EntityService', 'TaxonomyService', 'flash', function($rootScope, $scope, $http, $sce, $state, $filter, testators, places, militaryUnits, EntityService, TaxonomyService, flash) {
        $scope.form = {
            submit: {
                loading: false
            }
        };
        $scope.entity = {
            resources: [],
            will: {}
        };
        $scope.testators = $filter('orderBy')(testators, 'surname');
        $scope.militaryUnits = $filter('orderBy')(militaryUnits, 'name');

        /* Place's name management ---------------------------------------------------------------------------------  */
        $scope.places = places;
        for(let iEntity in $scope.places) {
            if($scope.places[iEntity].names.length > 0) {
                $scope.places[iEntity].name = $scope.places[iEntity].names[0].name;
            }
        }
        $scope.places = $filter('orderBy')($scope.places, 'name');
        /* End: Place's name management ----------------------------------------------------------------------------- */



        $scope.form.addResource = function(resourceNumber) {
            $scope.entity.resources.push({
                type: '',
                orderInWill: resourceNumber+1,
                images: '',
                notes: '',
                transcript: {
                    status: 'todo',
                    updateComment: 'Creation of the transcript'
                }
            });
        };

        $scope.form.submit.action = function() {
            console.log($scope.entity);
            $scope.form.submit.loading = true;
            postEntity();

            function postEntity() {
                console.log('postEntity');
                for(let resource of $scope.entity.resources) {
                    resource.images = resource.images.split(",");
                }

                return EntityService.postEntity($scope.entity).then(function(data) {
                    $scope.form.submit.loading = false;
                    $state.go('transcript.app.entity', {'id': data.id});
                }, function errorCallback(response) {
                    $scope.form.submit.loading = false;
                    if(response.data.code === 400) {
                        flash.error = "<ul>";
                        for(let field of response.data.errors.children) {
                            for(let error of field) {
                                if(error === "errors") {
                                    flash.error += "<li><strong>"+field+"</strong> : "+error+"</li>";
                                }
                            }
                        }
                        flash.error += "</ul>";
                        flash.error = $sce.trustAsHtml(flash.error);
                    }
                    console.log(response);
                });
            }
        }

    }])
;