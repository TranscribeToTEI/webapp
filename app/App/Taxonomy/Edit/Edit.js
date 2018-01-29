'use strict';

angular.module('transcript.app.taxonomy.edit', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('transcript.app.taxonomy.edit', {
                views: {
                    "page" : {
                        templateUrl: '/webapp/app/App/Taxonomy/Edit/Edit.html',
                        controller: 'AppTaxonomyEditCtrl'
                    }
                },
                url: '/{type}/{id}/edit',
                ncyBreadcrumb: {
                    parent: 'transcript.app.taxonomy.view({type: entity.dataType, id: entity.id})',
                    label: 'Modification'
                },
                tfMetaTags: {
                    title: 'Modification de {{ entity.name }} | Notices d\'autorité',
                },
                resolve: {
                    entity: function(TaxonomyService, $transition$) {
                        return TaxonomyService.getTaxonomyEntity($transition$.params().type, $transition$.params().id, 'id,index,taxonomyView,taxonomyLinks,iiif');
                    },
                    entities: function(TaxonomyService, $transition$) {
                        return TaxonomyService.getTaxonomyEntities($transition$.params().type, 'index');
                    },
                    bibliographies: function(BibliographyService, $transition$) {
                        return BibliographyService.getBibliographiesBy($transition$.params().type, $transition$.params().id, "id,bibliography");
                    },
                    testators: function(TaxonomyService) {
                        return TaxonomyService.getTaxonomyEntities('testators', 'index');
                    },
                    places: function(TaxonomyService) {
                        return TaxonomyService.getTaxonomyEntities('places', 'index');
                    },
                    militaryUnits: function(TaxonomyService) {
                        return TaxonomyService.getTaxonomyEntities('military-units', 'index');
                    }
                }
            })
            .state('transcript.app.taxonomy.create', {
                views: {
                    "page" : {
                        templateUrl: '/webapp/app/App/Taxonomy/Edit/Edit.html',
                        controller: 'AppTaxonomyEditCtrl'
                    }
                },
                url: '/{type}/new',
                ncyBreadcrumb: {
                    parent: 'transcript.app.taxonomy.home',
                    label: 'Nouveau'
                },
                tfMetaTags: {
                    title: 'Nouvelle | Notices d\'autorité',
                },
                resolve: {
                    entity: function() {
                        return null;
                    },
                    entities: function(TaxonomyService, $transition$) {
                        return TaxonomyService.getTaxonomyEntities($transition$.params().type, 'index');
                    },
                    bibliographies: function() {
                        return null;
                    },
                    testators: function(TaxonomyService) {
                        return TaxonomyService.getTaxonomyEntities('testators', 'index');
                    },
                    places: function(TaxonomyService) {
                        return TaxonomyService.getTaxonomyEntities('places', 'index');
                    },
                    militaryUnits: function(TaxonomyService) {
                        return TaxonomyService.getTaxonomyEntities('military-units', 'index');
                    }
                }
            })
    }])

    .controller('AppTaxonomyEditCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$transition$', '$filter', 'flash', 'Upload', 'TaxonomyService', 'GeonamesService', 'BibliographyService', 'entity', 'entities', 'testators', 'places', 'militaryUnits', 'bibliographies', function($log, $rootScope, $scope, $http, $sce, $state, $transition$, $filter, flash, Upload, TaxonomyService, GeonamesService, BibliographyService, entity, entities, testators, places, militaryUnits, bibliographies) {
        if(
            ($filter('contains')($rootScope.user.roles, "ROLE_TAXONOMY_EDIT") === false && ($rootScope.preferences.taxonomyEditAccess === 'selfAuthorization' || $rootScope.preferences.taxonomyEditAccess === 'controlledAuthorization'))
            ||
            ($rootScope.preferences.taxonomyEditAccess === 'forbidden' && ($filter('contains')($rootScope.user.roles, "ROLE_MODO") === false && $filter('contains')($rootScope.user.roles, "ROLE_ADMIN") === false && $filter('contains')($rootScope.user.roles, "ROLE_SUPER_ADMIN") === false))) {$state.go('transcript.error.403');}

        /* -- Functions Loader -------------------------------------------------------------------------------------- */
        function patchEntityLoader(entity, dataType) {
            $scope.form = fillForm(entity, dataType);
            patchEntity();

            function fillForm(data, type) {
                return TaxonomyService.getFormType(data, type);
            }
            $log.debug($scope.form);

            function patchEntity() {
                return TaxonomyService.patchTaxonomyEntity(dataType, entity.id, $scope.form)
                    .then(function(response) {
                        $scope.submit.loading = false;
                        if(response.status === 200) {
                            $scope.submit.success = true;
                            flash.success = "Vous allez être redirigé dans quelques instants...";
                            $state.go('transcript.app.taxonomy.view', {type: dataType, id: response.data.id});
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
                    $scope.submit.loading = false;
                    $log.debug(response);
                });
            }
        }
        function postEntityLoader(entity, dataType, action) {
            $scope.form = fillForm(entity, dataType);
            $scope.form.updateComment = "Création de l'entité";
            $log.debug($scope.form);
            postEntity();

            function fillForm(data, type) {
                return TaxonomyService.getFormType(data, type);
            }

            function postEntity() {
                return TaxonomyService.postTaxonomyEntity(dataType, $scope.form)
                    .then(function(response) {
                        $scope.submit.loading = false;
                        if(response.status === 200 || response.status === 201) {
                            $scope.submit.success = true;
                            if(action === "redirect") {
                                flash.success = "Vous allez être redirigé dans quelques instants...";
                                $state.go('transcript.app.taxonomy.view', {type: dataType, id: data.id});
                            } else if(action === "reloadPlaces") {
                                $scope.form = null;
                                return TaxonomyService.getTaxonomyEntities("places").then(function(data) {
                                    $scope.places = data;
                                });
                            }
                            $state.go('transcript.app.taxonomy.view', {type: dataType, id: data.id});
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
                    $scope.submit.loading = false;
                    $log.debug(response);
                });
            }
        }
        /* -- End : Functions Loader -------------------------------------------------------------------------------- */

        /* -- Scope management -------------------------------------------------------------------------------------- */
        $scope.testators = $filter('orderBy')(testators, 'indexName');
        $scope.places = $filter('orderBy')(places, 'indexName');
        $scope.militaryUnits = $filter('orderBy')(militaryUnits, 'name');
        $scope.entities = entities;

        $scope.submit = {
            loading: false,
            success: false
        };
        /* -- End : Scope management -------------------------------------------------------------------------------- */

        if(entity === null) {
            // Creation of a new entity
            $scope.entity = {
                dataType : $transition$.params().type
            };
            $scope.context = "create";
        } else {
            // Edition of entity
            $scope.entity = entity;
            $scope.entity.dataType = $transition$.params().type;
            $scope.entity.updateComment = "";
            $scope.context = "edit";

            /* ------------------------------------------------------------------------------------------------------ */
            /* If entity is testator */
            /* ------------------------------------------------------------------------------------------------------ */
            if($scope.entity.dataType === 'testators') {
                if($scope.entity.placeOfDeathNormalized) {$scope.entity.placeOfDeathNormalized = $scope.entity.placeOfDeathNormalized.id;}
                if($scope.entity.placeOfBirthNormalized) {$scope.entity.placeOfBirthNormalized = $scope.entity.placeOfBirthNormalized.id;}
                if($scope.entity.addressCity) {$scope.entity.addressCity = $scope.entity.addressCity.id;}
                if($scope.entity.militaryUnitNormalized) {$scope.entity.militaryUnitNormalized = $scope.entity.militaryUnitNormalized.id;}

                if($scope.entity.dateOfBirthNormalized) {$scope.entity.dateOfBirthNormalized = $filter('date')($scope.entity.dateOfBirthNormalized, 'yyyy-MM-dd')}
                if($scope.entity.dateOfBirthEndNormalized) {$scope.entity.dateOfBirthEndNormalized = $filter('date')($scope.entity.dateOfBirthEndNormalized, 'yyyy-MM-dd')}
                if($scope.entity.dateOfDeathNormalized) {$scope.entity.dateOfDeathNormalized = $filter('date')($scope.entity.dateOfDeathNormalized, 'yyyy-MM-dd')}
                if($scope.entity.dateOfDeathEndNormalized) {$scope.entity.dateOfDeathEndNormalized = $filter('date')($scope.entity.dateOfDeathEndNormalized, 'yyyy-MM-dd')}
            }
            /* ------------------------------------------------------------------------------------------------------ */

            /* ------------------------------------------------------------------------------------------------------ */
            /* Removing management */
            /* ------------------------------------------------------------------------------------------------------ */
            $scope.remove = {
                loading: false
            };

            $scope.remove.action = function() {
                $scope.remove.loading = true;
                removeEntity();

                function removeEntity() {
                    let dataType = $scope.entity.dataType;
                    return TaxonomyService.removeTaxonomyEntity($scope.entity.dataType, $scope.entity.id)
                        .then(function(response) {
                            if(response.status === 200) {
                                $scope.remove.loading = false;
                                flash.success = "Ce contenu a bien été supprimé. Vous allez être redirigé dans quelques instants...";
                                $state.go('transcript.app.taxonomy.list', {type: dataType});
                            } else if(response.status === 400) {
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
                        $scope.remove.loading = false;
                        $log.debug(response);
                    });
                }
            };
            /* ------------------------------------------------------------------------------------------------------ */
        }

        /* -- Place name management --------------------------------------------------------------------------------- */
        function parsePlaceNames() {
            if($scope.entity.name !== undefined && $scope.entity.name !== null) {
                $scope.entity.names = [{name: $scope.entity.name, updateComment: "entity creation"}];
            } else {$scope.entity.name = null;}
            if($scope.entity.frenchDepartement !== undefined && $scope.entity.frenchDepartement !== null) {
                $scope.entity.frenchDepartements = [{name: $scope.entity.frenchDepartement, updateComment: "entity creation"}];
            } else {$scope.entity.frenchDepartement = null;}
            if($scope.entity.frenchRegion !== undefined && $scope.entity.frenchRegion !== null) {
                $scope.entity.frenchRegions = [{name: $scope.entity.frenchRegion, updateComment: "entity creation"}];
            } else {$scope.entity.frenchRegion = null;}
            if($scope.entity.country !== undefined && $scope.entity.country !== null) {
                $scope.entity.countries = [{name: $scope.entity.country, updateComment: "entity creation"}];
            } else {$scope.entity.country = null;}
            if($scope.entity.city !== undefined && $scope.entity.city !== null) {
                $scope.entity.cities = [{name: $scope.entity.city, updateComment: "entity creation"}];
            } else {$scope.entity.city = null;}
            $log.debug($scope.entity);
        }
        /* -- End : Place name management --------------------------------------------------------------------------- */

        /* Entities sort management --------------------------------------------------------------------------------- */
        if($scope.entity.dataType === 'places') {
            $scope.entity.name = $scope.entity.indexName;
            $scope.entities = $filter('orderBy')($scope.entities, 'indexName');
        } else if($scope.entity.dataType === 'testators') {
            $scope.entities = $filter('orderBy')($scope.entities, 'indexName');
        } else if($scope.entity.dataType === 'military-units') {
            $scope.entities = $filter('orderBy')($scope.entities, 'name');
        }
        /* End: Entities sort management ---------------------------------------------------------------------------- */

        /* -- Action management ------------------------------------------------------------------------------------- */
        $scope.submit.action = function() {
            $scope.submit.loading = true;

            if($scope.entity.dataType === "places") {parsePlaceNames();}
            $log.debug($scope.entity);

            if(entity === null) {
                postEntityLoader($scope.entity, $scope.entity.dataType, "redirect");
            } else {
                patchEntityLoader($scope.entity, $scope.entity.dataType);
            }
        };
        /* -- End Action management --------------------------------------------------------------------------------- */

        /* -- Mémoire des Hommes management ------------------------------------------------------------------------- */
        if($scope.entity.dataType === 'testators' && $scope.entity.id !== undefined) {
            $scope.entity.memoireDesHommes = $scope.entity.memoireDesHommes.join(', ');
        }
        /* -- End: Mémoire des Hommes management--------------------------------------------------------------------- */

        /* -- Geonames management ----------------------------------------------------------------------------------- */
        $scope.geonames = {
            keywords: null,
            loading: false,
            result: null
        };

        $scope.geonames.action = function() {
            $scope.geonames.loading = true;
            requestGeonames();

            function requestGeonames() {
                return GeonamesService.search($scope.geonames.keywords)
                    .then(function(response) {
                        $scope.geonames.loading = false;
                        $log.debug(response);
                        if(response.status === 200) {
                            $scope.geonames.result = response.data;
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
                    $scope.geonames.loading = false;
                    $log.debug(response);
                });
            }
        };
        /* -- End Geonames management ------------------------------------------------------------------------------- */

        /* Upload new media ----------------------------------------------------------------------------------------- */
        $scope.media = {
            form: {
                image: null
            },
            submit: {
                loading: false,
                success: false
            }
        };

        /* Submit data */
        $scope.media.submit.action = function() {
            $scope.media.submit.loading = true;
            upload();
        };

        function upload() {
            let type = "", field = "";
            if($scope.entity.dataType === 'testators') {
                type = 'Testator';
                field = 'picture';
            }

            let url = "/media-contents?type="+type+"&field="+field;
            if($scope.entity.id !== undefined && $scope.entity.id !== null) {
                url = "/media-contents?type="+type+"&field="+field+"&id="+$scope.entity.id;
            }
            Upload.upload = Upload.upload({
                url: $rootScope.api+url,
                data: {media: $scope.media.form.illustration}
            }).then(function (response) {
                $log.debug(response);
                $scope.media.submit.loading = false;
                $scope.media.submit.success = true;
                $timeout(function() {
                    $scope.media.submit.success = false;
                }, 5000);

                if($scope.entity.dataType === 'testators' && $scope.entity.id !== undefined && $scope.entity.id !== null) {
                    $scope.entity.picture = response.data.picture;
                } else {
                    $scope.entity.picture = response.data;
                }
            }, function errorCallback(error) {
                $log.debug(error);
                $scope.media.submit.loading = false;
            });
        }
        /* End: Upload new media ------------------------------------------------------------------------------------ */

        /* ---------------------------------------------------------------------------------------------------------- */
        /* Bibliography Management */
        /* ---------------------------------------------------------------------------------------------------------- */
        $scope.bibliography = {
            elements: bibliographies,
            form: {
                submit: {
                    loading: false,
                    success: false
                }
            }
        };
        console.log($scope.bibliography);
        $scope.bibliographyEdit = true;
        $scope.bibliography.initForm = function() {
            $scope.bibliography.addForm = {
                id: null,
                type: null,
                printedReference: {
                    authors: null,
                    authorsEdit: null,
                    referenceTitle: null,
                    containerTitle: null,
                    containerType: null,
                    url: null,
                    otherInformation: null
                },
                manuscriptReference: {
                    documentName: null,
                    institutionName: null,
                    collectionName: null,
                    documentNumber: null,
                    url: null
                }
            };
        };
        $scope.bibliography.initForm();
        
        $scope.bibliography.action = function () {
            if ($scope.bibliography.addForm.type !== null) {
                $scope.bibliography.addForm.type = null;
            }
        };

        $scope.bibliography.form.action = function (id) {
            // If an id is defined > this is an edition of existent element
            $scope.bibliography.addForm.id = null;
            if (id !== undefined && id !== null) {
                let elementToEdit = $scope.bibliography.elements.filter(function (element) {
                    return (element.id === id);
                });
                if (elementToEdit !== null) {
                    elementToEdit = elementToEdit[0];
                }

                $scope.bibliography.addForm.id = id;
                if (elementToEdit.printedReference !== null) {
                    $scope.bibliography.addForm.type = 'printedReference';
                    $scope.bibliography.addForm.printedReference = elementToEdit.printedReference;
                    $scope.bibliography.addForm.printedReference.authorsEdit = $scope.bibliography.addForm.printedReference.authors.join(', ');
                } else if (elementToEdit.manuscriptReference !== null) {
                    $scope.bibliography.addForm.type = 'manuscriptReference';
                    $scope.bibliography.addForm.manuscriptReference = elementToEdit.manuscriptReference;
                }
            } else {
                $scope.bibliography.initForm();
            }
        };

        // This methods posts a new bibliographic element
        $scope.bibliography.form.submit.action = function (method, id) {
            $scope.bibliography.form.submit.loading = true;
            let elementToEdit = $scope.bibliography.elements.filter(function (element) {
                return (element.id === id);
            });
            if (elementToEdit !== null) {
                elementToEdit = elementToEdit[0];
            }

            // According to the type of the element
            let reference = {};
            if ($scope.bibliography.addForm.type === "printedReference") {
                reference = $scope.bibliography.addForm.printedReference;
                if (typeof reference.authors === 'string' && reference.authorsEdit.indexOf(',') !== -1) {
                    reference.authors = reference.authorsEdit.split(",");
                } else {
                    reference.authors = [reference.authorsEdit];
                }
                delete reference.authorsEdit;
                $log.debug(reference);
            } else if ($scope.bibliography.addForm.type === "manuscriptReference") {
                reference = $scope.bibliography.addForm.manuscriptReference;
                $log.debug(reference);
            }

            if (method === 'post') {
                reference.updateComment = 'Création de la référence';

                return BibliographyService.postBibliography($scope.entity.dataType, $scope.entity, reference, $scope.bibliography.addForm.type)
                    .then(function (response) {
                        return BibliographyService.getBibliographiesBy($scope.entity.dataType, $scope.entity.id).then(function (data) {
                            $scope.bibliography.elements = data;
                            $scope.bibliography.form.submit.loading = false;
                            $scope.bibliography.form.submit.success = true;
                            $('#addBibliographicElementModal').modal('hide');
                            $scope.bibliography.initForm();
                        });
                    });
            } else if (method === 'patch') {
                let idToPatch = reference.id;
                delete reference._links;
                delete reference.createDate;
                delete reference.createUser;
                delete reference.id;
                delete reference.updateDate;
                delete reference.updateUser;
                reference.updateComment = "Update bibliography element";

                return BibliographyService.patchBibliography(reference, $scope.bibliography.addForm.type, idToPatch)
                    .then(function (response) {
                        return BibliographyService.getBibliographiesBy($scope.entity.dataType, $scope.entity.id).then(function (data) {
                            $scope.bibliography.elements = data;
                            $scope.bibliography.form.submit.loading = false;
                            $scope.bibliography.form.submit.success = true;
                            $('#addBibliographicElementModal').modal('hide');
                            $scope.bibliography.initForm();
                        });
                    });
            }
        };

        $scope.bibliography.remove = function(id) {
            //TODO
        };
        /* Bibliography Management ---------------------------------------------------------------------------------- */

        /* ---------------------------------------------------------------------------------------------------------- */
        /* Pagination system */
        /* ---------------------------------------------------------------------------------------------------------- */
        $scope.results = $scope.entities;
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