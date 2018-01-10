'use strict';

angular.module('transcript.service.image', ['ui.router'])

    .service('ImageService', function($log, $http, $rootScope, $filter) {
        return {
            getThumbnail: function(entity) {
                let sendNoImage = false;
                if(entity.resources.length > 0) {
                    return $rootScope.iiif.server + '/testament_' + $filter('willNumberFormat')(entity.willNumber) + $rootScope.iiif.separator + 'JPEG' + $rootScope.iiif.separator + entity.resources[0].images[0] + $rootScope.iiif.extension + '.jpg/full/!150,150/0/default.jpg';
                }

                if(sendNoImage === true) {
                    return "./web/images/no-images.png";
                }
            }
        };
    })

;