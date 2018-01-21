'use strict';

angular.module('transcript.service.image', ['ui.router'])

    .service('ImageService', function($log, $http, $rootScope, $filter) {
        return {
            getThumbnail: function(entity, hostingOrganization) {
                let sendNoImage = false;
                if(entity.resources.length > 0) {
                    let code = "";
                    if(entity.will.hostingOrganization !== undefined) {code = entity.will.hostingOrganization.code;}
                    else if(hostingOrganization !== undefined) {code = hostingOrganization.code;}
                    return $rootScope.iiif.server + '/testament_' + code + '_' + $filter('willNumberFormat')(entity.willNumber) + $rootScope.iiif.separator + 'JPEG' + $rootScope.iiif.separator + entity.resources[0].images[0] + $rootScope.iiif.extension + '.jpg/full/!150,150/0/default.jpg';
                }

                if(sendNoImage === true) {
                    return "./web/images/no-images.png";
                }
            }
        };
    })

;