'use strict';

angular.module('transcript.admin.entity.edit', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('transcript.admin.entity.edit', {
                views: {
                    "page" : {
                        templateUrl: '/webapp/app/Admin/Entity/Edit/Edit.html',
                        controller: 'AdminEntityEditCtrl'
                    }
                },
                url: '/edit/:id',
                ncyBreadcrumb: {
                    parent: 'transcript.app.entity({id: entity.id})',
                    label: 'Modification'
                },
                tfMetaTags: {
                    title: 'Modification | Entités | Administration',
                },
                resolve: {
                    entity: function(EntityService, $transition$) {
                        return EntityService.getEntity($transition$.params().id);
                    },
                    places: function(TaxonomyService) {
                        return TaxonomyService.getTaxonomyEntities('places');
                    },
                    testators: function(TaxonomyService) {
                        return TaxonomyService.getTaxonomyEntities('testators');
                    },
                    organizations: function(HostingOrganizationService) {
                        return HostingOrganizationService.getOrganizations();
                    },
                    willTypes: function(WillTypeService) {
                        return WillTypeService.getTypes();
                    }
                }
            })
            .state('transcript.admin.entity.import', {
                views: {
                    "page" : {
                        templateUrl: '/webapp/app/Admin/Entity/Edit/Edit.html',
                        controller: 'AdminEntityEditCtrl'
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
                    entity: function() {
                        return null;
                    },
                    testators: function(TaxonomyService) {
                        return TaxonomyService.getTaxonomyEntities('testators');
                    },
                    places: function(TaxonomyService) {
                        return TaxonomyService.getTaxonomyEntities('places');
                    },
                    organizations: function(HostingOrganizationService) {
                        return HostingOrganizationService.getOrganizations();
                    },
                    willTypes: function(WillTypeService) {
                        return WillTypeService.getTypes();
                    }
                }
            })
    }])

    .controller('AdminEntityEditCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$filter', 'entity', 'flash', 'EntityService', 'HostingOrganizationService', 'TaxonomyService', 'WillTypeService', 'places', 'testators', 'organizations', 'willTypes', function($log, $rootScope, $scope, $http, $sce, $state, $filter, entity, flash, EntityService, HostingOrganizationService, TaxonomyService, WillTypeService, places, testators, organizations, willTypes) {
        /* ---------------------------------------------------------------------------------------------------------- */
        /* Scope management */
        /* ---------------------------------------------------------------------------------------------------------- */
        $scope.submit = {
            loading: false,
            success: false
        };
        $scope.remove = {
            loading: false
        };
        $scope.form = {};
        /* End: Scope management ------------------------------------------------------------------------------------ */

        /* ---------------------------------------------------------------------------------------------------------- */
        /* Entity management */
        /* ---------------------------------------------------------------------------------------------------------- */
        if(entity === null) {
            $scope.entity = {
                isShown: true,
                resources: [],
                will: {}
            };
        } else {
            $scope.entity = entity;
            $scope.entity.will.testator = $scope.entity.will.testator.id;
            if($scope.entity.will.willWritingPlaceNormalized) {$scope.entity.will.willWritingPlaceNormalized = $scope.entity.will.willWritingPlaceNormalized.id;}
            if($scope.entity.will.hostingOrganization) {$scope.entity.will.hostingOrganization = $scope.entity.will.hostingOrganization.id;}
            if($scope.entity.will.willType) {$scope.entity.will.willType = $scope.entity.will.willType.id;}

            if($scope.entity.will.minuteDateNormalized) {$scope.entity.will.minuteDateNormalized = $filter('date')($scope.entity.will.minuteDateNormalized, 'yyyy-MM-dd')}
            if($scope.entity.will.minuteDateEndNormalized) {$scope.entity.will.minuteDateEndNormalized = $filter('date')($scope.entity.will.minuteDateEndNormalized, 'yyyy-MM-dd')}
            if($scope.entity.will.willWritingDateNormalized) {$scope.entity.will.willWritingDateNormalized = $filter('date')($scope.entity.will.willWritingDateNormalized, 'yyyy-MM-dd')}
            if($scope.entity.will.willWritingDateEndNormalized) {$scope.entity.will.willWritingDateEndNormalized = $filter('date')($scope.entity.will.willWritingDateEndNormalized, 'yyyy-MM-dd')}
        }
        console.log($scope.entity);
        /* End: Entity management ----------------------------------------------------------------------------------- */


        /* ---------------------------------------------------------------------------------------------------------- */
        /* Taxonomy management */
        /* ---------------------------------------------------------------------------------------------------------- */
        $scope.testators = $filter('orderBy')(testators, 'surname');
        $scope.organizations = $filter('orderBy')(organizations, 'name');
        $scope.willTypes = $filter('orderBy')(willTypes, 'name');
        /* Place names management ----------------------------------------------------------------------------------- */
        $scope.places = places;
        for(let iEntity in $scope.places) {
            if($scope.places[iEntity].names.length > 0) {
                $scope.places[iEntity].name = $scope.places[iEntity].names[0].name;
            }
        }
        $scope.places = $filter('orderBy')($scope.places, 'name');
        /* End: Place names management ------------------------------------------------------------------------------ */
        /* End: Taxonomy management --------------------------------------------------------------------------------- */

        /* ---------------------------------------------------------------------------------------------------------- */
        /* Resources management */
        /* ---------------------------------------------------------------------------------------------------------- */
        $scope.form.addResource = function(resourceNumber) {
            $scope.entity.resources.push({
                type: '',
                orderInWill: resourceNumber+1,
                images: '',
                notes: ''
            });
        };

        $scope.form.removeResource = function(resource) {
            let index = $scope.entity.resources.indexOf(resource);
            $scope.entity.resources.splice(index,1);
        };
        /* End: Resources management -------------------------------------------------------------------------------- */

        /* ---------------------------------------------------------------------------------------------------------- */
        /* Submit management */
        /* ---------------------------------------------------------------------------------------------------------- */
        $scope.submit.action = function() {
            $scope.submit.loading = true;
            let formEntity = {
                isShown: $scope.entity.isShown,
                willNumber: $scope.entity.willNumber,
                will: {
                    title: "Testament "+$scope.entity.will.callNumber,
                    callNumber: $scope.entity.will.callNumber,
                    notaryNumber: $scope.entity.will.notaryNumber,
                    crpcenNumber: $scope.entity.will.crpcenNumber,
                    minuteDateString: $scope.entity.will.minuteDateString,
                    minuteYear: $scope.entity.will.minuteYear,
                    minuteDateNormalized: $filter('stringToDate')($scope.entity.will.minuteDateNormalized),
                    minuteDateEndNormalized: $filter('stringToDate')($scope.entity.will.minuteDateEndNormalized),
                    minuteLink: $scope.entity.will.minuteLink,
                    willWritingDateString: $scope.entity.will.willWritingDateString,
                    willWritingYear: $scope.entity.will.willWritingYear,
                    willWritingDateNormalized: $filter('stringToDate')($scope.entity.will.willWritingDateNormalized),
                    willWritingDateEndNormalized: $filter('stringToDate')($scope.entity.will.willWritingDateEndNormalized),
                    willWritingPlaceString: $scope.entity.will.willWritingPlaceString,
                    willWritingPlaceNormalized: $scope.entity.will.willWritingPlaceNormalized,
                    testator: $filter('objectToId')($scope.entity.will.testator),
                    hostingOrganization: $scope.entity.will.hostingOrganization,
                    identificationUsers: $scope.entity.will.identificationUsers,
                    willType: $scope.entity.will.willType,
                    additionalComments: $scope.entity.will.additionalComments,
                    description: $scope.entity.will.description,
                    placePhysDescSupport: $scope.entity.will.placePhysDescSupport,
                    placePhysDescHeight: $scope.entity.will.placePhysDescHeight,
                    placePhysDescWidth: $scope.entity.will.placePhysDescWidth,
                    placePhysDescHand: $scope.entity.will.placePhysDescHand,
                    placePhysDescNumber: $scope.entity.will.placePhysDescNumber,
                    envelopPhysDescSupport: $scope.entity.will.envelopPhysDescSupport,
                    envelopPhysDescHeight: $scope.entity.will.envelopPhysDescHeight,
                    envelopPhysDescWidth: $scope.entity.will.envelopPhysDescWidth,
                    envelopPhysDescHand: $scope.entity.will.envelopPhysDescHand,
                    codicilPhysDescSupport: $scope.entity.will.codicilPhysDescSupport,
                    codicilPhysDescHeight: $scope.entity.will.codicilPhysDescHeight,
                    codicilPhysDescWidth: $scope.entity.will.codicilPhysDescWidth,
                    codicilPhysDescHand: $scope.entity.will.codicilPhysDescHand,
                    codicilPhysDescNumber: $scope.entity.will.codicilPhysDescNumber,
                    isOfficialVersion: true,
                },
                resources: []
            };

            for(let resource of $scope.entity.resources) {
                if(typeof resource.images === 'string') {
                    resource.images = resource.images.split(",");
                }
                let content = {
                    type: resource.type,
                    orderInWill: resource.orderInWill,
                    notes: resource.notes,
                    images: resource.images
                };
                if(resource.id === undefined) {
                    content['transcript'] = {
                        status: 'todo',
                        updateComment: 'Création du fichier de transcription'
                    };
                }
                formEntity.resources.push(content);
            }
            $log.debug(formEntity);

            if($scope.entity.id === undefined) {
                $http.post($rootScope.api + '/entities', formEntity).then(function (response) {
                    $log.debug(response.data);
                    $scope.submit.loading = false;
                    $scope.submit.success = true;
                    flash.success = "Vous allez être redirigé dans quelques instants...";
                    $state.go('transcript.app.entity', {id: response.data.id});
                }, function errorCallback(response) {
                    $log.debug(response);
                    $scope.submit.loading = false;
                    flash.error = "<ul>";
                    for (let field in response.data.errors.children) {
                        for (let error in response.data.errors.children[field]) {
                            if (error === "errors") {
                                flash.error += "<li><strong>" + field + "</strong> : " + response.data.errors.children[field][error] + "</li>";
                            }
                        }
                    }
                    flash.error += "</ul>";
                });
            } else {
                $http.patch($rootScope.api + '/entities/' + $scope.entity.id, formEntity).then(function (response) {
                    $log.debug(response.data);
                    $scope.submit.loading = false;
                    $scope.submit.success = true;
                    flash.success = "Vous allez être redirigé dans quelques instants...";
                    $state.go('transcript.app.entity', {id: response.data.id});
                }, function errorCallback(response) {
                    $log.debug(response);
                    $scope.submit.loading = false;
                    flash.error = "<ul>";
                    for (let field in response.data.errors.children) {
                        for (let error in response.data.errors.children[field]) {
                            if (error === "errors") {
                                flash.error += "<li><strong>" + field + "</strong> : " + response.data.errors.children[field][error] + "</li>";
                            }
                        }
                    }
                    flash.error += "</ul>";
                });
            }
        };
        /* End: Submit management ----------------------------------------------------------------------------------- */

        /* ---------------------------------------------------------------------------------------------------------- */
        /* Remove entity */
        /* ---------------------------------------------------------------------------------------------------------- */
        $scope.remove.action = function() {
            if($scope.entity.id !== undefined) {
                $scope.remove.loading = true;
                removeEntity();
            }

            function removeEntity() {
                return EntityService.removeEntity($scope.entity.id).
                then(function(data) {
                    $scope.remove.loading = false;
                    $state.go('transcript.admin.entity.list');
                }, function errorCallback(response) {
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

                    }
                    $scope.remove.loading = false;
                    $log.debug(response);
                });
            }
        };
        /* End: Remove entity --------------------------------------------------------------------------------------- */

        /* ---------------------------------------------------------------------------------------------------------- */
        /* Reload related entity */
        /* ---------------------------------------------------------------------------------------------------------- */
        $scope.reload = {
            places: false,
            testators: false,
            organizations: false,
            willTypes: false
        };

        $scope.reload.action = function(type) {
            if(type === "testators") {
                $scope.reload.testators = true;
                return TaxonomyService.getTaxonomyEntities(type).then(function(response) {
                    $scope.testators = $filter('orderBy')(response, 'surname');
                    $scope.reload.testators = false;
                });
            } else if(type === "places") {
                $scope.reload.places = true;
                return TaxonomyService.getTaxonomyEntities(type).then(function(response) {
                    $scope.places = response;
                    for(let iEntity in $scope.places) {
                        if($scope.places[iEntity].names.length > 0) {
                            $scope.places[iEntity].name = $scope.places[iEntity].names[0].name;
                        }
                    }
                    $scope.places = $filter('orderBy')($scope.places, 'name');
                    $scope.reload.places = false;
                });
            } else if(type === "organizations") {
                $scope.reload.organizations = true;
                return HostingOrganizationService.getOrganizations().then(function(response) {
                    $scope.organizations = $filter('orderBy')(response, 'name');
                    $scope.reload.organizations = false;
                });
            } else if(type === "willTypes") {
                $scope.reload.willTypes = true;
                return WillTypeService.getTypes().then(function(response) {
                    $scope.willTypes = $filter('orderBy')(response, 'name');
                    $scope.reload.willTypes = false;
                });
            }
        };
        /* End: Reload related entity ------------------------------------------------------------------------------- */
    }])
;