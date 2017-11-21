'use strict';

angular.module('transcript.app.home', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.home', {
            views: {
                "page" : {
                    templateUrl: 'App/Home/Home.html',
                    controller: 'AppHomeCtrl'
                }
            },
            ncyBreadcrumb: {
                label: 'Accueil'
            },
            tfMetaTags: {
                title: 'Accueil',
            },
            url: '/',
            resolve: {
                entities: function(EntityService) {
                    return EntityService.getEntities();
                },
                contents: function(ContentService) {
                    return ContentService.getContents("blogContent", "public", "DESC", 10, 0);
                },
                staticContents: function(ContentService) {
                    return ContentService.getContents("staticContent", "public", "DESC", 10, 1);
                },
            }
        })
    }])

    .controller('AppHomeCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'entities', 'contents', 'staticContents', 'SearchService', 'EntityService', function($rootScope, $scope, $http, $sce, $state, entities, contents, staticContents, SearchService, EntityService) {
        $scope.entities = entities; console.log($scope.entities);
        $scope.contents = contents;
        $scope.staticContents = staticContents;

        for(let iEntity in $scope.entities) {
            if($scope.entities[iEntity].will.testator.placeOfBirthNormalized !== null && $scope.entities[iEntity].will.testator.placeOfBirthNormalized.names.length > 0) {
                $scope.entities[iEntity].will.testator.placeOfBirthNormalized.name = $scope.entities[iEntity].will.testator.placeOfBirthNormalized.names[0].name;
            }
            else if($scope.entities[iEntity].will.testator.placeOfBirthNormalized === null) {
                $scope.entities[iEntity].will.testator.placeOfBirthNormalized = {name: null};
            }
            if($scope.entities[iEntity].will.testator.placeOfDeathNormalized.names.length > 0) {
                $scope.entities[iEntity].will.testator.placeOfDeathNormalized.name = $scope.entities[iEntity].will.testator.placeOfDeathNormalized.names[0].name;
            }
        }

        /* -- Search interface ------------------------------------------------ */
        /* -- Definition of the fields --------------------------------------------------------------- */
        $scope.results = [];
        $scope.search = {
            form: {
                will: {
                    testator: {
                        name: null,
                        placeOfDeathNormalized: {
                            names: null
                        },
                        yearOfDeath: null,
                        placeOfBirthNormalized: {
                            names: null
                        }
                    }
                }
            },
            values: {
                will: {
                    testator: {
                        name: SearchService.dataset($scope.entities, "will.testator.name", "string"),
                        placeOfDeathNormalized: {
                            name: SearchService.dataset($scope.entities, "will.testator.placeOfDeathNormalized.name", "string")
                        },
                        yearOfDeath: SearchService.dataset($scope.entities, "will.testator.yearOfDeath", "string"),
                        placeOfBirthNormalized: {
                            name: SearchService.dataset($scope.entities, "will.testator.placeOfBirthNormalized.name", "string")
                        }
                    }
                }
            }
        };
        /* -- End : Definition of the fields --------------------------------------------------------- */

        /* -- Fields watching ------------------------------------------------------------------------ */
        $scope.$watch('search.form.will.testator.name', function() {
            if($scope.search.form.will.testator.name !== undefined) {
                if ($scope.search.form.will.testator.name !== null && $scope.search.form.will.testator.name !== ""&& $scope.search.form.will.testator.name.originalObject !== undefined) {
                    $scope.search.form.will.testator.name = $scope.search.form.will.testator.name.originalObject.value;
                    console.log($scope.search.form.will.testator.name);
                }
                refresh();
            }
        });

        $scope.$watch('search.form.will.testator.placeOfDeathNormalized.name', function() {
            if($scope.search.form.will.testator.placeOfDeathNormalized.name !== undefined) {
                if ($scope.search.form.will.testator.placeOfDeathNormalized.name !== null && $scope.search.form.will.testator.placeOfDeathNormalized.name !== "" && $scope.search.form.will.testator.placeOfDeathNormalized.name.originalObject !== undefined) {
                    $scope.search.form.will.testator.placeOfDeathNormalized.name = $scope.search.form.will.testator.placeOfDeathNormalized.name.originalObject.value;
                    console.log($scope.search.form.will.testator.placeOfDeathNormalized.name);
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

        $scope.$watch('search.form.will.testator.placeOfBirthNormalized.name', function() {
            if($scope.search.form.will.testator.placeOfBirthNormalized.name !== undefined) {
                if ($scope.search.form.will.testator.placeOfBirthNormalized.name !== null && $scope.search.form.will.testator.placeOfBirthNormalized.name !== "" && $scope.search.form.will.testator.placeOfBirthNormalized.name.originalObject !== undefined) {
                    $scope.search.form.will.testator.placeOfBirthNormalized.name = $scope.search.form.will.testator.placeOfBirthNormalized.name.originalObject.value;
                    console.log($scope.search.form.will.testator.placeOfBirthNormalized.name);
                }
                refresh();
            }
        });
        /* -- End : Fields watching ------------------------------------------------------------------ */

        function refresh() {
            let toEntities = $scope.entities;
            let toForm = $scope.search.form;
            $scope.results = SearchService.search(toEntities, toForm);
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
                url: "http://a.tile.openstreetmap.fr/{z}/{x}/{y}.png"
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

                if(entity.will.testator.placeOfDeathNormalized !== null && entity.will.testator.placeOfDeathNormalized.geographicalCoordinates !== null) {
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
        /* -- Search interface ------------------------------------------------ */
    }])
;