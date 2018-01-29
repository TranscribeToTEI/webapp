'use strict';

angular.module('transcript.filter.reverse', ['ui.router'])

    .filter('reverse', [function() {
        return function(items){
            if(items === undefined) {
                return [];
            } else if(items === null) {
                return [];
            } else if(items.length === 0) {
                return items;
            } else {
                return items.slice().reverse(); // Create a copy of the array and reverse the order of the items
            }
        };
    }])

;