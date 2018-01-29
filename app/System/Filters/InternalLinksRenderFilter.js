'use strict';

angular.module('transcript.filter.internalLinksRender', ['ui.router'])

    .filter('internalLinksRender', [function() {
        return function (text) {
            let doc = document.createElement('div');
            doc.innerHTML = text;

            let links = doc.getElementsByTagName("a");
            for (let oldLink of links) {
                if (oldLink.getAttribute("href").indexOf("#!/content") !== -1) {
                    let newLink = document.createElement("a");
                    newLink.setAttribute('ng-click', 'transcriptArea.interaction.help(\'' + oldLink.getAttribute('href').split('/')[2] + '\', \'helpContent\', false)');
                    newLink.innerHTML = oldLink.innerHTML;
                    oldLink.parentNode.insertBefore(newLink, oldLink);
                    oldLink.parentNode.removeChild(oldLink);
                }
            }

            return doc;
        }
    }])

;