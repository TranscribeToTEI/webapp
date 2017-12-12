'use strict';

angular.module('transcript.filter.objectToId', ['ui.router'])

    .filter('objectToId', ['$log', function($log) {
        return function (object) {
            if(object) {
                return object.id;
            } else {
                return null;
            }
        }
    }])

;