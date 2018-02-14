'use strict';

angular.module('transcript.admin.transcript.update', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.admin.transcript.update', {
            views: {
                "page" : {
                    templateUrl: '/webapp/app/Admin/Transcript/Update/Update.html',
                    controller: 'AdminTranscriptUpdateCtrl'
                }
            },
            url: '/xml-modification',
            ncyBreadcrumb: {
                parent: 'transcript.admin.home',
                label: 'Modification XML des transcriptions'
            },
            tfMetaTags: {
                title: 'Modification XML | Transcription | Administration',
            }
        })
    }])

    .controller('AdminTranscriptUpdateCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$filter', '$timeout', 'TranscriptService', function($log, $rootScope, $scope, $http, $sce, $state, $filter, $timeout, TranscriptService) {
        $scope.context = "search";
        $scope.search = {
            value: ""
        };
        $scope.edition = {
            imageSource: [],
            transcript: null,
            resource: null,
            entity: null
        };
        $scope.transcript = {
            submit: {
                loading: false,
                success: false,
                comment: ""
            }
        };

        $scope.search.submit = function() {
            if($scope.search.value !== "") {
                TranscriptService.getTranscript($scope.search.value, 'id,pageTranscript,versioning').then(function(data) {
                    $scope.context = "edit";

                    $scope.edition.transcript = data;
                    $scope.edition.resource = $scope.edition.transcript._embedded.resource;
                    $scope.edition.entity = $scope.edition.resource.entity;

                    $scope.edition.imageSource.push($rootScope.iiif.server + "/testament_" + $scope.edition.entity.will.hostingOrganization.code + "_" + $filter('willNumberFormat')($scope.edition.entity.willNumber, 4) + $rootScope.iiif.separator + "JPEG" + $rootScope.iiif.separator + $scope.edition.resource.images[0] + $rootScope.iiif.extension + ".jpg");
                });
            }
        };

        $scope.transcript.action = function() {
            $scope.transcript.submit.loading = true;

            $http.patch($rootScope.api + '/transcripts/' + $scope.edition.transcript.id + '?profile=id,pageTranscript,versioning',
                {
                    "content": $scope.edition.transcript.content,
                    "updateComment": $scope.transcript.submit.comment
                }
            ).then(function (response) {
                $scope.transcript.submit.loading = false;
                $scope.transcript.submit.comment = "";
                $scope.transcript.submit.success = true;
                $timeout(function () {
                    $scope.transcript.submit.success = false;
                }, 3000);
            });

        };

        /* ---------------------------------------------------------------------------------------------------------- */
        /* Viewer Management */
        /* ---------------------------------------------------------------------------------------------------------- */
        $scope.$watch('edition.imageSource', function() {
            console.log($scope.edition.imageSource);
            $scope.openseadragon = {
                prefixUrl: "/webapp/app/web/libraries/js/openseadragon/images/",
                tileSources: $scope.edition.imageSource,
                showRotationControl: true
            };
        });
        /* Viewer Management ---------------------------------------------------------------------------------------- */

    }])
;