'use strict';

angular.module('transcript.app.edition', ['ui.router'])
    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.edition', {
            views: {
                "page" : {
                    templateUrl: '/webapp/app/App/Edition/Edition.html',
                    controller: 'AppEditionCtrl'
                },
                "comment@transcript.app.edition" : {
                    templateUrl: '/webapp/app/System/Comment/tpl/Thread.html',
                    controller: 'SystemCommentCtrl'
                }
            },
            ncyBreadcrumb: {
                parent: 'transcript.app.entity({id: entity.id})',
                label: '{{ resource.type | resourceTypeName | ucFirstStrict }} {{resource.orderInWill}}'
            },
            tfMetaTags: {
                title: '{{ resource.type | resourceTypeName | ucFirstStrict }} {{resource.orderInWill}} de {{ entity.will.title }}',
            },
            url: '/edition/:idEntity/:idResource',
            resolve: {
                entity: function(EntityService, $transition$) {
                    return EntityService.getEntity($transition$.params().idEntity, 'infoWill,pageEdition,id');
                },
                resource: function(ResourceService, $transition$) {
                    return ResourceService.getResource($transition$.params().idResource, 'pageEdition,id');
                },
                thread: function(CommentService, $transition$) {
                    return CommentService.getThread('transcript-'+$transition$.params().idResource);
                },
                config: function() {
                    return YAML.load('System/Transcript/toolbar.yml');
                },
                teiInfo: function(TranscriptService) {
                    return TranscriptService.getTeiInfo();
                },
            }
        })
    }])

    .controller('AppEditionCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$filter', '$transition$', 'ResourceService', 'UserService', 'TranscriptService', 'flash', 'entity', 'config', 'resource', 'teiInfo', function($log, $rootScope, $scope, $http, $sce, $state, $filter, $transition$, ResourceService, UserService, TranscriptService, flash, entity, config, resource, teiInfo) {
        $scope.entity = entity; $log.debug($scope.entity);
        $scope.resource = resource; $log.debug($scope.resource);
        $scope.role = TranscriptService.getTranscriptRights($rootScope.user);
        $scope.config = config; $log.debug($scope.config);
        $scope.teiInfo = teiInfo.data; $log.debug($scope.teiInfo);
        $scope.currentEdition = null;
        $scope.microObjects = {
            active: true,
            activeClass: 'bg-danger'
        };
        $scope.tfMetaTagsName = $filter('ucFirstStrict')($filter('resourceTypeName')($scope.resource.type));
        $scope.buttonTranscript = {
            label: "Participer à la transcription",
            enable: false,
            class: "",
            modal: false
        };

        /* -- TranscriptLogs management ----------------------------------------------------------------------------- */
        if($scope.resource.transcript._embedded.isCurrentlyEdited === true) {
            $scope.currentEdition = $filter('filter')($scope.resource.transcript._embedded.logs, {isCurrentlyEdited: true})[0];
        }
        $log.debug($scope.currentEdition);
        /* -- TranscriptLogs management ----------------------------------------------------------------------------- */

        /* ---------------------------------------------------------------------------------------------------------- */
        /* Transcription button status */
        /* ---------------------------------------------------------------------------------------------------------- */
        if($scope.resource.transcript._embedded.isCurrentlyEdited === false && $scope.role === 'readOnly' && ($scope.resource.transcript.status !== 'validation' || $scope.resource.transcript.status !== 'validated')) {
            $scope.buttonTranscript.label = "<i class=\"fa fa-edit\"></i> Participer à la transcription";
            $scope.buttonTranscript.enable = false;
            $scope.buttonTranscript.class = "nav-link bg-primary";
            $scope.buttonTranscript.modal = "loginModal";
        } else if($scope.resource.transcript._embedded.isCurrentlyEdited === false && ($scope.role === 'editor' || $scope.role === 'validator') && $scope.resource.transcript.status === 'todo') {
            $scope.buttonTranscript.label = "<i class=\"fa fa-edit\"></i> Commencer cette transcription";
            $scope.buttonTranscript.enable = true;
            $scope.buttonTranscript.class = "nav-link bg-primary";
            $scope.buttonTranscript.modal = false;
        } else if($scope.resource.transcript._embedded.isCurrentlyEdited === false && ($scope.role === 'editor' || $scope.role === 'validator') && $scope.resource.transcript.status === 'transcription') {
            $scope.buttonTranscript.label = "<i class=\"fa fa-edit\"></i> Modifier cette transcription";
            $scope.buttonTranscript.enable = true;
            $scope.buttonTranscript.class = "nav-link bg-primary";
            $scope.buttonTranscript.modal = false;
        } else if($scope.resource.transcript._embedded.isCurrentlyEdited === false && $scope.role !== 'validator' && $scope.resource.transcript.status === 'validation') {
            $scope.buttonTranscript.label = "<i class=\"fa fa-check-square-o\"></i> En cours de validation";
            $scope.buttonTranscript.enable = false;
            $scope.buttonTranscript.class = "nav-link bg-info disabled";
            $scope.buttonTranscript.modal = false;
        } else if($scope.resource.transcript._embedded.isCurrentlyEdited === false && $scope.role === 'validator' && $scope.resource.transcript.status === 'validation') {
            $scope.buttonTranscript.label = "<i class=\"fa fa-check-square-o\"></i> En cours de validation";
            $scope.buttonTranscript.enable = true;
            $scope.buttonTranscript.class = "nav-link bg-info";
            $scope.buttonTranscript.modal = false;
        } else if($scope.resource.transcript._embedded.isCurrentlyEdited === false && $scope.role !== 'validator' && $scope.resource.transcript.status === 'validated') {
            $scope.buttonTranscript.label = "<i class=\"fa fa-check\"></i> Cette transcription est terminée";
            $scope.buttonTranscript.enable = false;
            $scope.buttonTranscript.class = "nav-link bg-success disabled";
            $scope.buttonTranscript.modal = false;
        } else if($scope.resource.transcript._embedded.isCurrentlyEdited === false && $scope.role === 'validator' && $scope.resource.transcript.status === 'validated') {
            $scope.buttonTranscript.label = "<i class=\"fa fa-check\"></i> Cette transcription est terminée";
            $scope.buttonTranscript.enable = true;
            $scope.buttonTranscript.class = "nav-link bg-success";
            $scope.buttonTranscript.modal = false;
        } else if($scope.resource.transcript._embedded.isCurrentlyEdited === true) {
            $scope.buttonTranscript.label = "<i class=\"fa fa-pencil-square-o\"></i> En cours d'édition par "+ $scope.currentEdition.createUser.name;
            $scope.buttonTranscript.enable = false;
            $scope.buttonTranscript.class = "nav-link bg-warning text-white disabled";
            $scope.buttonTranscript.modal = false;
        }

        if($rootScope.user !== undefined && $rootScope.user._embedded.preferences.tutorialStatus === 'todo') {
            $scope.buttonTranscript.modal = "edition-training-modal";
        }

        $scope.loadTranscriptInterface = function() {
            $('#edition-training-modal').modal('hide');
            $state.go('transcript.app.transcript', ({idEntity: $scope.entity.id, idResource: $scope.resource.id, idTranscript: $scope.resource.transcript.id}))
        };
        $scope.loadTrainingContent = function() {
            $('#edition-training-modal').modal('hide');
            if($rootScope.user._embedded.preferences.tutorialStatus === 'todo') {
                $state.go('transcript.app.training.content', {order: '0'});
            } else if($rootScope.user._embedded.preferences.tutorialStatus === 'inProgress' && $rootScope.user._embedded.preferences.tutorialProgress !== null) {
                $state.go('transcript.app.training.content', {order: $rootScope.user._embedded.preferences.tutorialProgress});
            }
        };
        /* Transcription button status ------------------------------------------------------------------------------ */

        /* ---------------------------------------------------------------------------------------------------------- */
        /* Viewer Management */
        /* ---------------------------------------------------------------------------------------------------------- */
        let imageSource = [];
        imageSource.push($rootScope.iiif.server+"/testament_" + $scope.entity.will.hostingOrganization.code + "_" + $filter('willNumberFormat')($scope.entity.willNumber, 4) + $rootScope.iiif.separator + "JPEG" + $rootScope.iiif.separator + $scope.resource.images[0] + $rootScope.iiif.extension + ".jpg/info.json");

        console.log(imageSource);
        $scope.openseadragon = {
            prefixUrl: "/webapp/app/web/libraries/js/openseadragon/images/",
            tileSources: imageSource,
            showRotationControl: true,
        };
        /* Viewer Management ---------------------------------------------------------------------------------------- */

        /* ---------------------------------------------------------------------------------------------------------- */
        /* Content Management */
        /* ---------------------------------------------------------------------------------------------------------- */
        if($scope.resource.transcript.content !== undefined && $scope.resource.transcript.content !== null) {
            $scope.encodedContent = TranscriptService.encodeHTML($scope.resource.transcript.content, $scope.config.tags, $scope.microObjects.active, $scope.teiInfo);
        } else {
            $scope.encodedContent = null;
        }
        $scope.microObjects.action = function () {
            $log.debug('test');
            if($scope.microObjects.active === true) {
                $scope.microObjects.active = false;
                $scope.microObjects.activeClass = 'active';
            } else {
                $scope.microObjects.active = true;
                $scope.microObjects.activeClass = 'bg-danger';
            }
            $scope.encodedContent = TranscriptService.encodeHTML($scope.resource.transcript.content, $scope.config.tags, $scope.microObjects.active, $scope.teiInfo);
        };
        /* Content Management --------------------------------------------------------------------------------------- */

        /* -- Modal Login management -------------------------------------------------------------------------------- */
        $scope.goRegister = function() {
            $('#loginModal').modal('hide');
            $state.go('transcript.app.security.register');
        };
        $scope.goLogin = function() {
            $('#loginModal').modal('hide');
            $state.go('transcript.app.security.login');
        };
        /* -- Modal Login management -------------------------------------------------------------------------------- */

        /* -- Admin management -------------------------------------------------------------------------------------- */
        $scope.admin = {
            status: {
                loading: false
            }
        };
        $scope.admin.status.action = function(state) {
            $scope.admin.status.loading = true;

            return TranscriptService.patchTranscript({status: state, updateComment: "Changement de statut pour : "+state}, $scope.resource.transcript.id)
            .then(function(response) {
                $scope.admin.status.loading = false;
                if(response.status === 200) {
                    $scope.resource.transcript.status = response.data.status;
                    flash.success = "Le status de la transcription a bien été mis à jour";
                } else if(response.status === 400) {
                    flash.error = "<ul>";
                    for(let field in response.data.errors.children) {
                        for(let error in response.data.errors.children[field]) {
                            if(error === "errors") {
                                flash.error += "<li><strong>"+field+"</strong> : "+response.data.errors.children[field][error]+"</li>";
                            }
                        }
                    }
                    flash.error += "</ul>";
                    $log.debug(response);
                }
            });
        };
        /* -- Admin management -------------------------------------------------------------------------------------- */

    }])
;