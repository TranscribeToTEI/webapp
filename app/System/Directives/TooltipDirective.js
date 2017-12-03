'use strict';

angular.module('transcript.directive.tooltip', ['ui.router'])

    .directive('tooltip', [function () {
        return function (scope, element, attrs) {
            $(element).hover(function(){
                // on mouseenter
                $(element).tooltip('show');
            }, function(){
                // on mouseleave
                $(element).tooltip('hide');
            });
        }
    }])

;