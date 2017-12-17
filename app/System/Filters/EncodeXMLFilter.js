'use strict';

angular.module('transcript.filter.encodeXML', ['ui.router'])

    .filter('encodeXML', ['$log', function($log) {
        return function (text) {
            $log.debug(text);
            text = text.replace(/<gi>/g, "<code>").replace(/<\/gi>/g, "</code>")
                       .replace(/<list>/g, "<ul>").replace(/<\/list>/g, "</ul>")
                       .replace(/<item>/g, "<li>").replace(/<\/item>/g, "</li>")
                       .replace(/<egXML xmlns="http:\/\/www\.tei-c\.org\/ns\/Examples">/g, "<pre><code>").replace(/<\/egXML>/g, "</code></pre>");

            text = text.replace(/<pre><code>(.+?)<\/code><\/pre>/g, function(match, group1, index, original) {
                group1 = group1.replace(/</g, "&lt;").replace(/>/g, "&gt;\n");
                return "<pre><code>"+group1+"<\/code><\/pre>";
            });

            return text;
        }
    }])

;