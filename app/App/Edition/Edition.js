'use strict';

angular.module('transcript.app.edition', ['ui.router'])
    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.edition', {
            views: {
                "page" : {
                    templateUrl: 'App/Edition/Edition.html',
                    controller: 'AppEditionCtrl'
                },
                "comment@transcript.app.edition" : {
                    templateUrl: 'System/Comment/tpl/Thread.html',
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
                    return YAML.load('App/Transcript/toolbar.yml');
                }
            }
        })
    }])

    .controller('AppEditionCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', '$filter', '$transition$', 'ResourceService', 'UserService', 'TranscriptService', 'flash', 'entity', 'config', 'resource', function($rootScope, $scope, $http, $sce, $state, $filter, $transition$, ResourceService, UserService, TranscriptService, flash, entity, config, resource) {
        $scope.entity = entity; console.log($scope.entity);
        $scope.resource = resource;
        $scope.role = TranscriptService.getTranscriptRights($rootScope.user);
        $scope.config = config;
        $scope.tfMetaTagsName = $filter('ucFirstStrict')($filter('resourceTypeName')($scope.resource.type));
        $scope.currentEdition = null;

        /* -- TranscriptLogs management ----------------------------------------------------------------------------- */
        if($scope.resource.transcript._embedded.isOpened === false) {
            $scope.currentEdition = $filter('filter')($scope.resource.transcript._embedded.logs, {isOpened: false})[0];
        }
        console.log($scope.currentEdition);
        /* -- TranscriptLogs management ----------------------------------------------------------------------------- */

        /* -- EncodedContent management ----------------------------------------------------------------------------- */
        if($scope.resource.transcript.content !== null) {
            let encodeLiveRender = $scope.resource.transcript.content;
            for (let buttonId in $scope.config.tags) {
                encodeLiveRender = TranscriptService.encodeHTML(encodeLiveRender, $scope.config.tags[buttonId]);
            }
            $scope.encodedContent = $sce.trustAsHtml(encodeLiveRender);
        }
        /* -- EncodedContent management ----------------------------------------------------------------------------- */

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

            return TranscriptService.patchTranscript({status: state, updateComment: "Changing status to "+state}, $scope.resource.transcript.id)
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
                    console.log(response);
                }
            });
        };
        /* -- Admin management -------------------------------------------------------------------------------------- */

    }])
;