'use strict';

angular.module('transcript.service.comment', ['ui.router'])

    .service('CommentService', function($log, $http, $rootScope, $sce, $state) {
        return {
            getThread: function(id) {
                let CS = this;
                return $http.get($rootScope.api+"/threads/"+id+"/comments").then(function(response) {
                    $log.debug(response.data);
                    return response.data;
                }, function errorCallback(response) {
                    if((response.status === 404 || response.status === 400) && $rootScope.user !== undefined) {
                        $log.debug(response);
                        return CS.postThread(id).then(function (data) {
                            return data;
                        });
                    } else {
                        $log.debug(response);
                        return null;
                    }
                });
            },
            getThreadSharedByUsers: function(id1, id2) {
                let CS = this;
                return $http.get($rootScope.api+"/threads/users-"+id1+"-"+id2+"/comments").then(function(response) {
                    $log.debug(response.data);
                    return response.data;
                }, function errorCallback(response) {
                    if((response.status === 404 || response.status === 400) && $rootScope.user !== undefined) {
                        return $http.get($rootScope.api+"/threads/users-"+id2+"-"+id1+"/comments").then(function(response) {
                            for(let comment in response.data.comments) {
                                response.data.comments[comment] = JSON.parse(response.data.comments[comment]);
                            }
                            $log.debug(response.data);
                            return response.data;
                        }, function errorCallback(response) {
                            if((response.status === 404 || response.status === 400) && $rootScope.user !== undefined) {
                                $log.debug(response);
                                return CS.postThread("users-"+id1+"-"+id2).then(function (data) {
                                    return data;
                                });
                            } else {
                                $log.debug(response);
                                return response;
                            }
                        });
                    } else {
                        $log.debug(response);
                        return response;
                    }
                });
            },
            getThreadsBySelfUser: function() {
                if($rootScope.user !== undefined) {
                    return this.getThreadsByUser($rootScope.user.id).then(function(data) {return data;});
                } else {
                    return null;
                }
            },
            getThreadsByUser: function(id) {
                return $http.get($rootScope.api+"/override-threads?user="+id).then(function(response) {
                    $log.debug(response.data);
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            },
            postThread: function(id) {
                return $http.post($rootScope.api+"/threads",
                    {
                        "fos_comment_thread":
                            {
                                "id": id,
                                "permalink": $rootScope.siteURL+'/thread/'+id
                            }
                    }).
                then(function(response) {
                    $log.debug(response);
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug(response);
                });
            },
            postComment: function(id, content) {
                return $http.post($rootScope.api+"/threads/"+id+"/comments",
                    {
                        "fos_comment_comment":
                            {
                                "body": content
                            }
                    }).
                then(function(response) {
                    $log.debug(response.data);
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug(response);
                });
            }
        };
    })

;