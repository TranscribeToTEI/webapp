'use strict';

angular.module('transcript.service.image', ['ui.router'])

    .service('ImageService', function($http, $rootScope) {
        return {
            getThumbnail: function(entity) {
                let sendNoImage = false;
                if(entity.resources.length > 0) {
                    return $rootScope.api_web+'/images/data/testament_'+entity.willNumber+'/JPEG/FRAN_Poilus_t-'+entity.willNumber+'_'+entity.resources[0].images[0]+'.jpg';
                }

                if(sendNoImage === true) {
                    return "./web/images/no-images.png";
                }
            }
        };
    })

;