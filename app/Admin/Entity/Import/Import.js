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
                title: 'Importation | Entités | Administration',
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
                },
                organizations: function(HostingOrganizationService) {
                    return HostingOrganizationService.getOrganizations();
                }
            }
        })
    }])

    .controller('AdminEntityImportCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', '$filter', 'EntityService', 'TaxonomyService', 'flash', 'testators', 'places', 'militaryUnits', 'organizations', function($rootScope, $scope, $http, $sce, $state, $filter, EntityService, TaxonomyService, flash, testators, places, militaryUnits, organizations) {
        $scope.form = {
            submit: {
                loading: false,
                success: false
            }
        };
        $scope.entity = {
            isShown: true,
            resources: [],
            will: {}
        };
        $scope.testators = $filter('orderBy')(testators, 'surname');
        $scope.militaryUnits = $filter('orderBy')(militaryUnits, 'name');
        $scope.organizations = organizations;

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

                return EntityService.postEntity($scope.entity).then(function(response) {
                    console.log(response);
                    $scope.form.submit.loading = false;
                    if(response.status === 200 || response.status === 201) {
                        $scope.form.submit.success = true;
                        flash.success = "Vous allez être redirigé dans quelques instants ...";
                        $state.go('transcript.app.entity', {'id': data.id});
                    } else if(response.data.code === 400) {
                        flash.error = "<ul>";
                        for(let field of response.data.errors.children) {
                            for(let error of field) {
                                if(error === "errors") {
                                    flash.error += "<li><strong>"+field+"</strong> : "+error+"</li>";
                                }
                            }
                        }
                        flash.error += "</ul>";
                    }

                }, function errorCallback(response) {
                    $scope.form.submit.loading = false;
                    console.log(response);
                });
            }
        }

    }])
;