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
                    return EntityService.getEntities("search");
                }
            }
        })
    }])

    .controller('AppSearchCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$filter', 'flash', 'EntityService', 'SearchService', 'ImageService', 'entities', function($log, $rootScope, $scope, $http, $sce, $state, $filter, flash, EntityService, SearchService, ImageService, entities) {
        $scope.entities = entities; $log.debug($scope.entities);
        for(let iEntity in $scope.entities) {
            if($scope.entities[iEntity].will.hostingOrganization === undefined) {
                $scope.entities[iEntity].will.hostingOrganization = {name: null};
            }
            if($scope.entities[iEntity].will.testator.placeOfBirthNormalized !== undefined && $scope.entities[iEntity].will.testator.placeOfBirthNormalized.names.length > 0) {
                $scope.entities[iEntity].will.testator.placeOfBirthNormalized.name = $scope.entities[iEntity].will.testator.placeOfBirthNormalized.names[0].name;
            }
            else if($scope.entities[iEntity].will.testator.placeOfBirthNormalized === undefined) {
                $scope.entities[iEntity].will.testator.placeOfBirthNormalized = {name: null};
            }
            if($scope.entities[iEntity].will.testator.placeOfDeathNormalized.names.length > 0) {
                $scope.entities[iEntity].will.testator.placeOfDeathNormalized.name = $scope.entities[iEntity].will.testator.placeOfDeathNormalized.names[0].name;
            }
        }
        $log.debug($scope.entities);
        $scope.results = [];
        $scope.limitToResults = 50;

        /* -- Definition of the fields --------------------------------------------------------------- */
        $scope.search = {
            form: {
                will: {
                    testator: {
                        name: null,
                        placeOfDeathNormalized: {
                            name: null
                        },
                        yearOfDeath: null,
                        placeOfBirthNormalized: {
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
                    hostingOrganization: {
                        name: SearchService.dataset($scope.entities, "will.hostingOrganization.name", "string")
                    },
                    testator: {
                        name: SearchService.dataset($scope.entities, "will.testator.name", "string"),
                        placeOfDeathNormalized: {
                            name: SearchService.dataset($scope.entities, "will.testator.placeOfDeathNormalized.name", "string")
                        },
                        yearOfDeath: SearchService.dataset($scope.entities, "will.testator.yearOfDeath", "string"),
                        placeOfBirthNormalized: {
                            name: SearchService.dataset($scope.entities, "will.testator.placeOfBirthNormalized.name", "string")
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
                    $scope.search.form.will.hostingOrganization.name = $scope.search.form.will.hostingOrganization.name.originalObject.value;
                    $log.debug($scope.search.form.will.hostingOrganization.name);
                }
                refresh();
            }
        });

        $scope.$watch('search.form.will.testator.name', function() {
            if($scope.search.form.will.testator.name !== undefined) {
                if ($scope.search.form.will.testator.name !== null && $scope.search.form.will.testator.name !== ""&& $scope.search.form.will.testator.name.originalObject !== undefined) {
                    $scope.search.form.will.testator.name = $scope.search.form.will.testator.name.originalObject.value;
                    $log.debug($scope.search.form.will.testator.name);
                }
                refresh();
            }
        });

        $scope.$watch('search.form.will.testator.placeOfDeathNormalized.name', function() {
            if($scope.search.form.will.testator.placeOfDeathNormalized.name !== undefined) {
                if ($scope.search.form.will.testator.placeOfDeathNormalized.name !== null && $scope.search.form.will.testator.placeOfDeathNormalized.name !== "" && $scope.search.form.will.testator.placeOfDeathNormalized.name.originalObject !== undefined) {
                    $scope.search.form.will.testator.placeOfDeathNormalized.name = $scope.search.form.will.testator.placeOfDeathNormalized.name.originalObject.value;
                    $log.debug($scope.search.form.will.testator.placeOfDeathNormalized.name);
                }
                refresh();
            }
        });

        $scope.$watch('search.form.will.testator.yearOfDeath', function() {
            if($scope.search.form.will.testator.yearOfDeath !== undefined) {
                if ($scope.search.form.will.testator.yearOfDeath !== null && $scope.search.form.will.testator.yearOfDeath !== "" && $scope.search.form.will.testator.yearOfDeath.originalObject !== undefined) {
                    $scope.search.form.will.testator.yearOfDeath = $scope.search.form.will.testator.yearOfDeath.originalObject.value;
                    $log.debug($scope.search.form.will.testator.yearOfDeath);
                }
                refresh();
            }
        });

        $scope.$watch('search.form.will.testator.placeOfBirthNormalized.name', function() {
            if($scope.search.form.will.testator.placeOfBirthNormalized.name !== undefined) {
                if ($scope.search.form.will.testator.placeOfBirthNormalized.name !== null && $scope.search.form.will.testator.placeOfBirthNormalized.name !== "" && $scope.search.form.will.testator.placeOfBirthNormalized.name.originalObject !== undefined) {
                    $scope.search.form.will.testator.placeOfBirthNormalized.name = $scope.search.form.will.testator.placeOfBirthNormalized.name.originalObject.value;
                    $log.debug($scope.search.form.will.testator.placeOfBirthNormalized.name);
                }
                refresh();
            }
        });

        $scope.$watch('search.form.will.willWritingYear', function() {
            if($scope.search.form.will.willWritingYear !== undefined) {
                if ($scope.search.form.will.willWritingYear !== null && $scope.search.form.will.willWritingYear !== "" && $scope.search.form.will.willWritingYear.originalObject !== undefined) {
                    $scope.search.form.will.willWritingYear = $scope.search.form.will.willWritingYear.originalObject.value;
                    $log.debug($scope.search.form.will.willWritingYear);
                }
                refresh();
            }
        });

        $scope.$watch('search.form.will.callNumber', function() {
            if($scope.search.form.will.callNumber !== undefined) {
                if ($scope.search.form.will.callNumber !== null && $scope.search.form.will.callNumber !== "" && $scope.search.form.will.callNumber.originalObject !== undefined) {
                    $scope.search.form.will.callNumber = $scope.search.form.will.callNumber.originalObject.value;
                    $log.debug($scope.search.form.will.callNumber);
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

            if($scope.search.form.will.testator.placeOfBirthNormalized.name !== undefined || $scope.search.form.will.testator.yearOfDeath !== undefined || $scope.search.form.will.testator.placeOfDeathNormalized.name !== undefined || $scope.search.form.will.testator.name !== undefined) {
                $scope.limitToResults = 1000;
            } else {
                $scope.limitToResults = 50;
            }
            $scope.results = $filter('shuffle')($scope.results);

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

                if(entity.will.testator.placeOfDeathNormalized !== undefined && entity.will.testator.placeOfDeathNormalized.geographicalCoordinates !== undefined) {
                    let coord = entity.will.testator.placeOfDeathNormalized.geographicalCoordinates.split('+');
                    let id = "maker"+entity.will.testator.id;
                    let marker = {
                        lat: parseFloat(coord[0]),
                        lng: parseFloat(coord[1]),
                        message: entity.will.testator.name+' décédé à '+entity.will.testator.placeOfDeathNormalized.name,
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