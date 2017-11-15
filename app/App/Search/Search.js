'use strict';

angular.module('transcript.app.search', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.search', {
            views: {
                "page" : {
                    templateUrl: 'App/Search/Search.html',
                    controller: 'AppSearchCtrl'
                }
            },
            url: '/search',
            ncyBreadcrumb: {
                parent: 'transcript.app.home',
                label: 'Recherche'
            },
            tfMetaTags: {
                title: 'Recherche',
            },
            resolve: {
                entities: function(EntityService) {
                    return EntityService.getEntities();
                },
                organizations: function(HostingOrganizationService) {
                    return HostingOrganizationService.getOrganizations();
                }
            }
        })
    }])

    .controller('AppSearchCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'flash', 'EntityService', 'SearchService', 'ImageService', 'entities', 'organizations', function($rootScope, $scope, $http, $sce, $state, flash, EntityService, SearchService, ImageService, entities, organizations) {
        $scope.organizations = organizations;
        $scope.entities = entities;
        for(let iEntity in $scope.entities) {
            if($scope.entities[iEntity].will.testator.placeOfBirth !== null && $scope.entities[iEntity].will.testator.placeOfBirth.names.length > 0) {
                $scope.entities[iEntity].will.testator.placeOfBirth.name = $scope.entities[iEntity].will.testator.placeOfBirth.names[0].name;
            }
            if($scope.entities[iEntity].will.testator.placeOfDeath.names.length > 0) {
                $scope.entities[iEntity].will.testator.placeOfDeath.name = $scope.entities[iEntity].will.testator.placeOfDeath.names[0].name;
            }
        }
        console.log($scope.entities);
        $scope.results = [];

        /* -- Definition of the fields --------------------------------------------------------------- */
        $scope.search = {
            form: {
                will: {
                    testator: {
                        name: null,
                        placeOfDeath: {
                            name: null
                        },
                        yearOfDeath: null,
                        placeOfBirth: {
                            name: null
                        }
                    },
                    hostingOrganization: {
                        name: null
                    },
                    willWritingYear: null,
                    callNumber: null
                }
            },
            filters: {
                status: {
                    todo: true,
                    transcription: true,
                    validation: true,
                    validated: true
                }
            },
            values: {
                will: {
                    hostingOrganization: $scope.organizations,
                    testator: {
                        name: SearchService.dataset($scope.entities, "will.testator.name", "string"),
                        placeOfDeath: {
                            name: SearchService.dataset($scope.entities, "will.testator.placeOfDeath.name", "string")
                        },
                        yearOfDeath: SearchService.dataset($scope.entities, "will.testator.yearOfDeath", "string"),
                        placeOfBirth: {
                            name: SearchService.dataset($scope.entities, "will.testator.placeOfBirth.name", "string")
                        }
                    },
                    willWritingYear: SearchService.dataset($scope.entities, "will.willWritingYear", "string"),
                    // Call number is not here because it's not used as an autocompleted field
                    // Same for status
                }
            },
            result: {
                display: "list"
            },
            resultsSorting: "will.willWritingYear"
        };
        $scope.imageService = ImageService;
        /* -- End : Definition of the fields --------------------------------------------------------- */

        /* -- Fields watching ------------------------------------------------------------------------ */
        $scope.$watch('search.form.will.hostingOrganization.name', function() {
            if($scope.search.form.will.hostingOrganization.name !== undefined) {
                if ($scope.search.form.will.hostingOrganization.name !== null && $scope.search.form.will.hostingOrganization.name !== "" && $scope.search.form.will.hostingOrganization.name.originalObject !== undefined) {
                    $scope.search.form.will.hostingOrganization.name = $scope.search.form.will.hostingOrganization.originalObject.code;
                    console.log($scope.search.form.will.hostingOrganization.name);
                }
                refresh();
            }
        });

        $scope.$watch('search.form.will.testator.name', function() {
            if($scope.search.form.will.testator.name !== undefined) {
                if ($scope.search.form.will.testator.name !== null && $scope.search.form.will.testator.name !== ""&& $scope.search.form.will.testator.name.originalObject !== undefined) {
                    $scope.search.form.will.testator.name = $scope.search.form.will.testator.name.originalObject.value;
                    console.log($scope.search.form.will.testator.name);
                }
                refresh();
            }
        });

        $scope.$watch('search.form.will.testator.placeOfDeath.name', function() {
            if($scope.search.form.will.testator.placeOfDeath.name !== undefined) {
                if ($scope.search.form.will.testator.placeOfDeath.name !== null && $scope.search.form.will.testator.placeOfDeath.name !== "" && $scope.search.form.will.testator.placeOfDeath.name.originalObject !== undefined) {
                    $scope.search.form.will.testator.placeOfDeath.name = $scope.search.form.will.testator.placeOfDeath.name.originalObject.value;
                    console.log($scope.search.form.will.testator.placeOfDeath.name);
                }
                refresh();
            }
        });

        $scope.$watch('search.form.will.testator.yearOfDeath', function() {
            if($scope.search.form.will.testator.yearOfDeath !== undefined) {
                if ($scope.search.form.will.testator.yearOfDeath !== null && $scope.search.form.will.testator.yearOfDeath !== "" && $scope.search.form.will.testator.yearOfDeath.originalObject !== undefined) {
                    $scope.search.form.will.testator.yearOfDeath = $scope.search.form.will.testator.yearOfDeath.originalObject.value;
                    console.log($scope.search.form.will.testator.yearOfDeath);
                }
                refresh();
            }
        });

        $scope.$watch('search.form.will.testator.placeOfBirth.name', function() {
            if($scope.search.form.will.testator.placeOfBirth.name !== undefined) {
                if ($scope.search.form.will.testator.placeOfBirth.name !== null && $scope.search.form.will.testator.placeOfBirth.name !== "" && $scope.search.form.will.testator.placeOfBirth.name.originalObject !== undefined) {
                    $scope.search.form.will.testator.placeOfBirth.name = $scope.search.form.will.testator.placeOfBirth.name.originalObject.value;
                    console.log($scope.search.form.will.testator.placeOfBirth.name);
                }
                refresh();
            }
        });

        $scope.$watch('search.form.will.willWritingYear', function() {
            if($scope.search.form.will.willWritingYear !== undefined) {
                if ($scope.search.form.will.willWritingYear !== null && $scope.search.form.will.willWritingYear !== "" && $scope.search.form.will.willWritingYear.originalObject !== undefined) {
                    $scope.search.form.will.willWritingYear = $scope.search.form.will.willWritingYear.originalObject.value;
                    console.log($scope.search.form.will.willWritingYear);
                }
                refresh();
            }
        });

        $scope.$watch('search.form.will.callNumber', function() {
            if($scope.search.form.will.callNumber !== undefined) {
                if ($scope.search.form.will.callNumber !== null && $scope.search.form.will.callNumber !== "" && $scope.search.form.will.callNumber.originalObject !== undefined) {
                    $scope.search.form.will.callNumber = $scope.search.form.will.callNumber.originalObject.value;
                    console.log($scope.search.form.will.callNumber);
                }
                refresh();
            }
        });

        $scope.$watch('search.filters.status.todo', function() {
            refresh();
        });
        $scope.$watch('search.filters.status.transcription', function() {
            refresh();
        });
        $scope.$watch('search.filters.status.validation', function() {
            refresh();
        });
        $scope.$watch('search.filters.status.validated', function() {
            refresh();
        });
        /* -- End : Fields watching ------------------------------------------------------------------ */

        function refresh() {
            let toEntities = $scope.entities;
            let toForm = $scope.search.form;
            $scope.results = SearchService.filter(SearchService.search(toEntities, toForm), $scope.search.filters);
            setMarkers();
        }

        /* -- Setting up map ----------------------------------------------------------------- */
        // Doc is here: http://tombatossals.github.io/angular-leaflet-directive/#!/examples/center
        angular.extend($scope, {
            center: {
                lat: 49.9128,
                lng: 3.7587,
                zoom: 6
            },
            tiles: {
                url: "http://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
            },
            markers: {

            },
            defaults: {
                scrollWheelZoom: false
            },
            legend: {
                position: 'bottomleft',
                colors: [ '#000000' ],
                labels: [ 'Lieux de décès' ]
            }
        });

        function setMarkers() {
            let markers = {};
            for(let result in $scope.results) {
                let entity = $scope.results[result];

                if(entity.will.testator.placeOfDeath !== null && entity.will.testator.placeOfDeath.geographicalCoordinates !== null) {
                    let coord = entity.will.testator.placeOfDeath.geographicalCoordinates.split('+');
                    let id = "maker"+entity.will.testator.id;
                    let marker = {
                        lat: parseFloat(coord[0]),
                        lng: parseFloat(coord[1]),
                        message: entity.will.testator.name+' décédé à '+entity.will.testator.placeOfDeath.name,
                        focus: false,
                        draggable: false
                    };
                    markers[id] = marker;
                }
            }
            $scope.markers = markers;
        }
        /* -- End : Setting up map ----------------------------------------------------------- */
    }])
;