'use strict';

angular.module('transcript.filter.internalAttributesRender', ['ui.router'])

    .filter('internalAttributesRender', [function() {
        return function (object) {
            let array = '';

            let count = 0;
            for(let iO in object) {
                if(count > 0) {array += ';';}
                array += iO+':'+object[iO];
                count += 1;
            }

            if(array.length === 0) {
                array = null;
            }

            return array;
        }
    }])

;