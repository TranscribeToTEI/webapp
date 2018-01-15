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
                    return EntityService.getEntity($transition$.params().idEntity);
                },
                resource: function(ResourceService, $transition$) {
                    return ResourceService.getResource($transition$.params().idResource);
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

        /* ---------------------------------------------------------------------------------------------------------- */
        /* Viewer Management */
        /* ---------------------------------------------------------------------------------------------------------- */
        let imageSource = [];
        imageSource.push($rootScope.iiif.server+"/testament_" + $filter('willNumberFormat')($scope.entity.willNumber, 4) + $rootScope.iiif.separator + "JPEG" + $rootScope.iiif.separator + $scope.resource.images[0] + $rootScope.iiif.extension + ".jpg/info.json");

        console.log(imageSource);
        $scope.openseadragon = {
            prefixUrl: "/webapp/app/web/libraries/js/openseadragon/images/",
            tileSources: imageSource
        };
        /* Viewer Management ---------------------------------------------------------------------------------------- */

        /* ---------------------------------------------------------------------------------------------------------- */
        /* Content Management */
        /* ---------------------------------------------------------------------------------------------------------- */
        if($scope.resource.transcript.content !== null) {
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

        /* -- TranscriptLogs management ----------------------------------------------------------------------------- */
        if($scope.resource.transcript._embedded.isCurrentlyEdited === true) {
            $scope.currentEdition = $filter('filter')($scope.resource.transcript._embedded.logs, {isCurrentlyEdited: true})[0];
        }
        $log.debug($scope.currentEdition);
        /* -- TranscriptLogs management ----------------------------------------------------------------------------- */

        /* -- Contributors management ------------------------------------------------------------------------------- */
        function getUser(username) {
            return UserService.getUserByUsername(username).then(function(data) {
                $scope.contributors.push({
                    user: data,
                    contributionsNumber: ResourceService.getContributionsNumberByUser($scope.resource, data)
                });
            });
        }

        $scope.contributors = [];
        let contributors = ResourceService.getContributors($scope.resource);
        for(let id in contributors) {
            getUser(contributors[id]);
        }
        /* -- Contributors management ------------------------------------------------------------------------------- */

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