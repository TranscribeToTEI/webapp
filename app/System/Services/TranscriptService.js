'use strict';

angular.module('transcript.service.transcript', ['ui.router'])

    .service('TranscriptService', function($log, $http, $rootScope, $filter) {
        let functions = {
            getTranscripts: function(profile) {
                let profileStr = "";
                if(profile !== undefined) {
                    profileStr = "?profile="+profile;
                }

                return $http.get(
                    $rootScope.api+"/transcripts"+profileStr
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            },
            getTranscriptsByStatus: function(status, profile) {
                let profileStr = "";
                if(profile !== undefined) {
                    profileStr = "&profile="+profile;
                }

                return $http.get(
                    $rootScope.api+"/transcripts?status="+status+profileStr
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            },
            getTranscript: function(id, profile) {
                let profileStr = "";
                if(profile !== undefined) {
                    profileStr = "?profile="+profile;
                }

                return $http.get(
                    $rootScope.api+"/transcripts/"+id+profileStr
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            },
            patchTranscript: function(form, id, profile) {
                let profileStr = "";
                if(profile !== undefined) {
                    profileStr = "?profile="+profile;
                }

                return $http.patch(
                    $rootScope.api+"/transcripts/"+id+profileStr,
                    form
                ).then(function(response) {
                    $log.debug(response);
                    return response;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            },
            getTranscriptRights: function(user) {
                let role;
                $log.debug(user);

                if(user !== undefined && user !== null) {
                    if ($.inArray("ROLE_SUPER_ADMIN", user.roles) !== -1 || $.inArray("ROLE_ADMIN", user.roles) !== -1 || $.inArray("ROLE_MODO", user.roles) !== -1) {
                        role = "validator";
                    } else {
                        role = "editor";
                    }
                } else {
                    role = "readOnly";
                }
                return role;
            },
            /**
             * This function encodes the TEI XML in HTML for live render.
             *
             * More information about the tags, the tags and their render into toolbar.yml
             *
             * @param encodeLiveRender string
             * @param tags array
             * @param isMicroObject
             * @param teiInfo
             * @returns string
             */
            encodeHTML: function(encodeLiveRender, tags, isMicroObject, teiInfo) {
                //$log.debug(encodeLiveRender);
                //$log.debug(tags);

                for(let iT in tags) {
                    let tag = tags[iT];

                    let replace = "";

                    //$log.debug(tag.xml);
                    if(tag.xml.unique === true) {
                        replace = "<"+tag.xml.name+"(.*?)/>";
                        let regExp = new RegExp(replace,"g");
                        encodeLiveRender = encodeLiveRender.replace(regExp, function(match, attributesString, index, original) {
                            return functions.tagConstruction(tags[tag.btn.id], "singleTag", functions.extractAttributes(attributesString), null, isMicroObject);
                        });
                    } else if(tag.xml.unique === false) {
                        replace = "<"+tag.xml.name+"(.*?)>(.*?)</"+tag.xml.name+">";
                        let regExp = new RegExp(replace,"g");

                        encodeLiveRender = encodeLiveRender.replace(regExp, function(match, attributesString, content, index, original) {
                            /* Computing tooltip for special tags (like Choice) ------------------------------------- */
                            let extraTooltip = null;
                            if(tag.xml.name === "choice") {
                                let TEIElement = functions.getTEIElementInformation(encodeLiveRender.substring(0, encodeLiveRender.indexOf(match)+2), encodeLiveRender.substring(encodeLiveRender.indexOf(match)+2, encodeLiveRender.length), null, tags, teiInfo, false),
                                    content = "",
                                    prefix = "";
                                //$log.debug(TEIElement);

                                for(let iC in TEIElement.children) {
                                    let child = TEIElement.children[iC];
                                    if(child.name === "corr") {
                                        content = child.content;
                                        prefix = "Forme correcte : ";
                                    } else if(child.name === "reg") {
                                        content = child.content;
                                        prefix = "Forme régulière : ";
                                    } else if(child.name === "expan") {
                                        content = child.content;
                                        prefix = "Forme complète : ";
                                    }
                                }

                                extraTooltip = {
                                    type: "tooltip",
                                    content: content,
                                    prefix: prefix
                                }
                            } else if (tag.xml.name === "app") {
                                let TEIElement = functions.getTEIElementInformation(encodeLiveRender.substring(0, encodeLiveRender.indexOf(match)+2), encodeLiveRender.substring(encodeLiveRender.indexOf(match)+2, encodeLiveRender.length), null, tags, teiInfo, false),
                                    content = "";

                                for(let iC in TEIElement.children) {
                                    let child = TEIElement.children[iC];
                                    if(child.name === "note") {
                                        content = child.content;
                                    }
                                }

                                extraTooltip = {
                                    type: "popover",
                                    content: content,
                                    title: "Note d'apparat critique"
                                }
                            } else if (tag.xml.name === "app") {
                                //Pas sur que ça marche ça
                                let TEIElement = functions.getTEIElementInformation(encodeLiveRender.substring(0, encodeLiveRender.indexOf(match)+2), encodeLiveRender.substring(encodeLiveRender.indexOf(match)+2, encodeLiveRender.length), null, tags, teiInfo, false);
                                if(TEIElement.parent !== undefined && TEIElement.parent !== null && TEIElement.parent.name === "app") {
                                    attributesString += "class: \"hidden\"";
                                }
                            }
                            /* End: Computing tooltip --------------------------------------------------------------- */

                            return functions.tagConstruction(tags[tag.xml.name], "startTag", functions.extractAttributes(attributesString), extraTooltip, isMicroObject)+content+functions.tagConstruction(tags[tag.xml.name], "endTag", functions.extractAttributes(attributesString), null, isMicroObject);
                        });
                    }
                }

                return encodeLiveRender;
            },
            /**
             * This function extracts attributes array from string
             *
             * @param attributesString
             * @returns {Array}
             */
            extractAttributes: function(attributesString) {
                let attributes = [];
                if(attributesString) {
                    let matchListAttributes = attributesString.match(/[a-zA-Z0-9:_]+(\s*=\s*(?:".*?"|'.*?'|[\^'">\s]+))/g);
                    //$log.debug(matchListAttributes);
                    if(matchListAttributes && matchListAttributes.length > 0) {
                        for(let iA in matchListAttributes) {
                            attributes.push({
                                name: matchListAttributes[iA].replace(/([a-zA-Z0-9:_]+)\s*=\s*(?:"(.*?)"|'(.*?)'|[\^'">\s]+)/, "$1"),
                                value: matchListAttributes[iA].replace(/([a-zA-Z0-9:_]+)\s*=\s*(?:"(.*?)"|'(.*?)'|[\^'">\s]+)/, "$2$3")
                            });
                        }
                    }

                    //$log.debug(attributes);
                }

                return attributes;
            },
            /**
             *
             * @param xmlAttributes
             * @returns {Array}
             */
            convertXMLAttributes: function(xmlAttributes) {
                let attributes = [];
                if(xmlAttributes.length > 0) {
                    for(let iA in xmlAttributes) {
                        if(xmlAttributes[iA].name === "rend") {
                            let value = "";
                            switch (xmlAttributes[iA].value) {
                                case "left":
                                    value = "text-left";
                                    break;
                                case "right":
                                    value = "text-right";
                                    break;
                                case "centered":
                                    value = "text-center";
                                    break;
                                case "superscript":
                                    value = "text-sup";
                                    break;
                                case "underlined":
                                    value = "text-underlined";
                                    break;
                                case "double-underlined":
                                    value = "text-double-underlined";
                                    break;
                                case "superscript-underlined":
                                    value = "text-sup text-underlined";
                                    break;
                                case "capital-letters":
                                    value = "text-uppercase";
                                    break;
                                case "horizontal-line": //for metamark
                                    value = "";
                                    break;
                                case "horizontal-wavy-line": //for metamark
                                    value = "";
                                    break;
                                case "cross": //for metamark
                                    value = "";
                                    break;
                                case "other": //for metamark
                                    value = "";
                                    break;
                            }

                            if(attributes["class"] !== undefined) {
                                attributes["class"] = value;
                            } else {
                                attributes["class"] = " "+value;
                            }
                        } else {
                            attributes[xmlAttributes[iA].name] = xmlAttributes[iA].value;
                        }
                    }
                }

                return attributes;
            },
            /**
             * This function returns the HTML value of an XML tag
             *
             * @param tag -> object from tags list
             * @param type -> startTag, endTag, singleTag
             * @param xmlAttributes array
             * @param extraTooltip null|array
             * @param isMicroObject bool
             * @returns {string}
             */
            tagConstruction: function(tag, type, xmlAttributes, extraTooltip, isMicroObject) {
                /* Attributes management ---------------------------------------------------------------------------- */
                let attributesHtml = "",
                    attributes = functions.convertXMLAttributes(xmlAttributes),
                    construction = '',
                    bgColor = '';

                // bgColor management --------
                if(tag.html.bgColor !== undefined) {
                    bgColor = tag.html.bgColor;
                } else if(tag.btn !== undefined && tag.btn.level === 1) {
                    bgColor = 'text-info';
                } else {
                    bgColor = 'text-primary';
                }

                // attributes management -------
                if(tag.html.bgColor !== undefined && tag.html.bgColorText !== undefined && tag.html.bgColorText === true) {
                    if(tag.html.attributes['class'] !== undefined) {
                        tag.html.attributes['class'] += " "+ tag.html.bgColor;
                    } else {
                        tag.html.attributes['class'] = tag.html.bgColor;
                    }
                }
                if(tag.btn !== undefined && tag.btn.id === "note") {
                    // If the tag is "note" and it is in a app context
                    if(tag.html.attributes['hidden'] === undefined) {
                        tag.html.attributes['hidden'] = "hidden";
                    }
                }
                if(tag.html.attributes !== undefined) {
                    for(let attribute in tag.html.attributes) {
                        if(attributes[attribute] !== undefined) {
                            attributes[attribute] += " "+tag.html.attributes[attribute];
                        } else {
                            attributes[attribute] = tag.html.attributes[attribute];
                        }
                    }
                }

                for(let iA in attributes) {
                    attributesHtml += " "+iA+"=\""+attributes[iA]+"\"";
                }

                if(extraTooltip !== null) {
                    if(extraTooltip.type === 'tooltip') {
                        attributesHtml += ' tooltip-placement="top" data-toggle="tooltip" data-placement="top" title="' + extraTooltip.prefix + extraTooltip.content + '" onmouseenter="$(this).tooltip(\'show\')"';
                    } else if(extraTooltip.type === 'popover') {
                        attributesHtml += ' data-toggle="popover" title="' + extraTooltip.title + '" data-content="' + extraTooltip.content + '" onmouseenter="$(this).popover(\'show\')" ';
                    }
                } else if(tag.html.extra !== undefined) {
                    if(tag.html.extra === 'tooltip') {
                        attributesHtml += ' tooltip-placement="top" data-toggle="tooltip" data-placement="top" title="' + tag.btn.title + '" onmouseenter="$(this).tooltip(\'show\')"';
                    }
                }
                /* End: Attributes management ----------------------------------------------------------------------- */

                /* Icon content ------------------------------------------------------------------------------------- */
                if(isMicroObject === true && tag.html.icon !== undefined && tag.html.icon.position === "before" && (type === "startTag" || type === "singleTag")) {
                    construction += ' <span class="'+bgColor+'"><i class="'+tag.btn.icon+'" title="'+tag.btn.title+'"></i></span> ';
                }
                if(isMicroObject === true && tag.html.icon !== undefined && tag.html.icon.position === "append" && type === "endTag") {
                    construction += ' <span class="'+bgColor+'"><i class="'+tag.btn.icon+'" title="'+tag.btn.title+'"></i></span> ';
                }
                /* Icon content ------------------------------------------------------------------------------------- */

                if(tag.html.marker !== undefined && type === "endTag") {
                    construction += tag.html.marker.split('--')[1];
                }

                /* Tag content -------------------------------------------------------------------------------------- */
                if(type === "endTag") {
                    construction += "</"+tag.html.name+">";
                } else if(type === "startTag") {
                    construction +=  "<"+tag.html.name+attributesHtml+">";
                } else if(type === "singleTag") {
                    if(tag.html.unique === true && tag.html.icon === undefined) {
                        construction +=  "<"+tag.html.name+attributesHtml+" />";
                    } else {
                        construction +=  "<"+tag.html.name+attributesHtml+">";
                        if(isMicroObject === true && tag.html.icon !== undefined && (tag.html.icon.position === "prepend" || tag.html.icon.position === "append")) {
                            construction += ' <span class="'+bgColor+'" title="'+tag.btn.title+'"><i class="'+tag.btn.icon+'"></i></span> ';
                        }
                        construction += "</"+tag.html.name+">";
                    }
                }
                /* Tag content -------------------------------------------------------------------------------------- */

                if(tag.html.marker !== undefined && type === "startTag") {
                    construction += tag.html.marker.split('--')[0];
                }

                /* Icon content ------------------------------------------------------------------------------------- */
                if(isMicroObject === true && tag.html.icon !== undefined && tag.html.icon.position === "prepend" && type === "startTag") {
                    construction += ' <span class="'+bgColor+'"><i class="'+tag.btn.icon+'" title="'+tag.btn.title+'"></i></span> ';
                }
                if(isMicroObject === true && tag.html.icon !== undefined && tag.html.icon.position === "after" && (type === "endTag" || type === "singleTag")) {
                    construction += ' <span class="'+bgColor+'"><i class="'+tag.btn.icon+'" title="'+tag.btn.title+'"></i></span> ';
                }
                /* Icon content ------------------------------------------------------------------------------------- */

                //$log.debug(construction);
                return construction;
            },
            loadFile: function(file) {
                return 'App/Transcript/tpl/'+file+'.html';
            },
            /* ------------------------------------------------------------------------------------------------------ */
            /* Functions for transcript */
            /* ------------------------------------------------------------------------------------------------------ */
            /**
             * This function returns the position of a tag
             * Position meaning position of the '|<' character of the tag
             *
             * @param tpContent
             * @param teiElement
             * @param order
             * @returns integer|null
             */
            getTagPos: function(tpContent, teiElement, order) {
                let tagPosA = null, tagPosB = null, tagPosC = null;
                if(order === "ASC") {
                    tagPosA = tpContent.indexOf("<"+teiElement.name+" ");
                    tagPosB = tpContent.indexOf("<"+teiElement.name+"/>");
                    tagPosC = tpContent.indexOf("<"+teiElement.name+">");
                } else if(order === "DESC") {
                    tagPosA = tpContent.lastIndexOf("<"+teiElement.name+" ");
                    tagPosB = tpContent.lastIndexOf("<"+teiElement.name+"/>");
                    tagPosC = tpContent.lastIndexOf("<"+teiElement.name+">");
                }

                let tagPosArray = [tagPosA, tagPosB, tagPosC];
                tagPosArray.sort();
                tagPosArray.reverse();

                return (tagPosArray[0] !== -1) ? tagPosArray[0]: null;
            },
            /**
             * This function computes the value of teiElement.endTag.start.index
             *
             * @param teiElement
             * @param leftOfCursor
             * @param rightOfCursor
             * @param content
             * @param relativePosition
             * @param carriedCounter
             *
             * @returns integer
             */
            computeEndOfTag: function(teiElement, leftOfCursor, rightOfCursor, content, relativePosition, carriedCounter) {
                let iEndPos = relativePosition+content.substring(relativePosition, content.length).indexOf("</" + teiElement.name),
                    iPortion = content.substring(relativePosition+1+teiElement.name.length, iEndPos);

                if(iPortion.indexOf("<"+teiElement.name) !== -1) {
                    // Meaning there is another similar tag as child
                    let list = iPortion.match(new RegExp("<"+teiElement.name,'g'));
                    return functions.computeEndOfTag(teiElement, leftOfCursor, rightOfCursor, content, iEndPos, carriedCounter+list.length-1);
                } else if(carriedCounter > 0) {
                    // If the carried list is not empty
                    return functions.computeEndOfTag(teiElement, leftOfCursor, rightOfCursor, content, iEndPos, carriedCounter-1);
                } else {
                    if(carriedCounter > 0 && iEndPos !== null) {
                        // If we are computing the value for a parent:
                        let previous = 0;
                        for(let i = 0; i <= carriedCounter; i++) {
                            previous = rightOfCursor.indexOf("</" + teiElement.name);
                            rightOfCursor = rightOfCursor.substring(previous+2+teiElement.name.length+1, rightOfCursor.length);
                            iEndPos += rightOfCursor.indexOf("</" + teiElement.name)+2+teiElement.name.length+1;
                        }
                        iEndPos += 2+teiElement.name.length;
                    }
                    // Else, we return the tag pos
                    return iEndPos;
                }
            },
            /**
             * This function computes the value of teiElement.startTag.start.index
             *
             * @param teiElement
             * @param content
             * @param relativePosition
             * @param carriedCounter
             *
             * @returns integer
             */
            computeStartOfTag: function(teiElement, content, relativePosition, carriedCounter) {
                // We are looking for the last position of tag pos
                let iTagPos = functions.getTagPos(content.substring(0, relativePosition), teiElement, "DESC");
                let iPortion = content.substring(iTagPos, relativePosition);

                if(iPortion.indexOf("</"+teiElement.name+">") !== -1) {
                    // Meaning there is another similar tag as child
                    let list = iPortion.match(new RegExp("</"+teiElement.name+">",'g'));
                    return functions.computeStartOfTag(teiElement, content, iTagPos, carriedCounter+list.length-1);
                } else if(carriedCounter > 0) {
                    // If the carried list is not empty
                    return functions.computeStartOfTag(teiElement, content, iTagPos, carriedCounter-1);
                } else {
                    // Else, we return the tag pos
                    return iTagPos;
                }
            },
            /**
             * This function computes the following values from the end position:
             *  - name
             *  - type
             *  - startTag.start.index
             *  - startTag.end.index
             *  - startTag.content
             *  - endTag.start.index
             *  - endTag.end.index
             *  - endTag.content
             *  - parentLeftOfCursor
             *  - parentRightOfCursor
             *
             * @param teiElement
             * @param leftOfCursor
             * @param rightOfCursor
             * @param content
             * 
             * @returns object
             */
            computeFromEndTag: function(teiElement, leftOfCursor, rightOfCursor, content) {
                // $log.debug('computeFromEndTag');

                teiElement.name                 = teiElement.startTag.content.replace(/<\/([a-zA-Z]+)>/g, '$1');
                teiElement.type                 = "standard";

                teiElement.endTag.start.index   = leftOfCursor.lastIndexOf("<");
                let endContentFull              = content.substring(teiElement.endTag.start.index, content.length);
                teiElement.endTag.content       = endContentFull.substring(0, endContentFull.indexOf(">")+1);
                teiElement.endTag.end.index     = teiElement.endTag.start.index+teiElement.endTag.content.length-1;

                teiElement.startTag.start.index = functions.computeStartOfTag(teiElement, content, teiElement.endTag.start.index, 0);
                let startContentFull            = content.substring(teiElement.startTag.start.index, content.length);
                teiElement.startTag.content     = startContentFull.substring(0, startContentFull.indexOf(">")+1);
                teiElement.startTag.end.index   = teiElement.startTag.start.index+teiElement.startTag.content.length-1;

                teiElement.parentLeftOfCursor   = leftOfCursor.substring(0, teiElement.startTag.start.index);
                teiElement.parentRightOfCursor  = leftOfCursor.substring(teiElement.startTag.start.index, leftOfCursor.length)+rightOfCursor;

                return teiElement;
            },
            /**
             * This function computes the following values from the start position:
             *  - name
             *  - type
             *  - startTag.start.index
             *  - startTag.end.index
             *  - startTag.content
             *  - endTag.start.index
             *  - endTag.end.index
             *  - endTag.content
             *  - parentLeftOfCursor
             *  - parentRightOfCursor
             *
             * @param teiElement
             * @param leftOfCursor
             * @param rightOfCursor
             * @param content
             * @returns object
             */
            computeFromStartTag: function(teiElement, leftOfCursor, rightOfCursor, content) {
                // $log.debug('computeFromStartTag');

                teiElement.name                 = teiElement.startTag.content.replace(/<([a-zA-Z]+).*>/g, '$1');
                teiElement.type                 = "standard";

                teiElement.startTag.start.index = functions.getTagPos(leftOfCursor+rightOfCursor.substring(0, rightOfCursor.indexOf('<')), teiElement, "DESC");
                let startContentFull            = content.substring(teiElement.startTag.start.index, content.length);
                teiElement.startTag.content     = startContentFull.substring(0, startContentFull.indexOf(">")+1);
                teiElement.startTag.end.index   = teiElement.startTag.start.index+teiElement.startTag.content.length-1;

                teiElement.endTag.start.index   = functions.computeEndOfTag(teiElement, leftOfCursor, rightOfCursor, content, teiElement.startTag.start.index, 0);
                let endContentFull              = content.substring(teiElement.endTag.start.index, content.length);
                teiElement.endTag.content       = endContentFull.substring(0, endContentFull.indexOf(">")+1);
                teiElement.endTag.end.index     = teiElement.endTag.start.index+teiElement.endTag.content.length-1;

                teiElement.parentLeftOfCursor   = leftOfCursor.substring(0, teiElement.startTag.start.index);
                teiElement.parentRightOfCursor  = leftOfCursor.substring(teiElement.startTag.start.index, leftOfCursor.length)+rightOfCursor;

                return teiElement;
            },
            /**
             * This functions computes the following values of single tag:
             *  - name
             *  - type
             *  - startTag.start.index
             *  - startTag.end.index
             *  - startTag.content
             *  - parentLeftOfCursor
             *  - parentRightOfCursor
             *
             * @param teiElement
             * @param leftOfCursor
             * @param rightOfCursor
             * @param content
             *
             * @returns object
             */
            computeFromSingleTag: function(teiElement, leftOfCursor, rightOfCursor, content) {
                // $log.debug('computeFromSingleTag');

                teiElement.name                 = teiElement.startTag.content.replace(/<([a-zA-Z]+).*\/>/g, '$1');
                teiElement.type                 = "single";

                teiElement.startTag.start.index = leftOfCursor.lastIndexOf('<');
                let startContentFull            = content.substring(teiElement.startTag.start.index, content.length);
                teiElement.startTag.content     = startContentFull.substring(0, startContentFull.indexOf(">")+1);
                teiElement.startTag.end.index   = teiElement.startTag.start.index+teiElement.startTag.content.length-1;

                teiElement.parentLeftOfCursor   = leftOfCursor.substring(0, teiElement.startTag.start.index);
                teiElement.parentRightOfCursor  = leftOfCursor.substring(teiElement.startTag.start.index, leftOfCursor.length)+rightOfCursor;

                return teiElement;
            },
            /**
             * This function computes children of TEI Element
             * @param teiElement
             * @param content
             * @param lines
             * @param tags
             * @param teiInfo
             */
            computeChildren: function(teiElement, content, lines, tags, teiInfo) {
                //$log.debug(teiElement);
                let array = [];

                if(teiElement.content.indexOf('<') !== -1) {
                    array = functions.computeChildStructure(teiElement, content, lines, tags, teiInfo, null, array);
                }

                return array;
            },
            computeChildStructure: function(teiElement, content, lines, tags, teiInfo, previousChild, array) {
                let newChild = functions.computeChild(teiElement, content, lines, tags, teiInfo, previousChild);
                array.push(newChild);

                //$log.debug(newChild.endTag.end.index+1);
                //$log.debug(teiElement.endTag.start.index);
                if(newChild.endTag.end.index+1 !== teiElement.endTag.start.index) {
                    functions.computeChildStructure(teiElement, content, lines, tags, teiInfo, newChild, array);
                }

                return array;
            },
            computeChild: function(teiElement, content, lines, tags, teiInfo, previousChild) {
                let childrenLeftOfCursor = "";
                if(previousChild === null) {
                    childrenLeftOfCursor = teiElement.parentLeftOfCursor+teiElement.startTag.content+teiElement.content.substring(0, teiElement.content.indexOf('<')+2);
                } else {
                    let endPreviousChild = previousChild.parentLeftOfCursor+previousChild.startTag.content+previousChild.content+previousChild.endTag.content;
                    childrenLeftOfCursor = endPreviousChild+content.substring(endPreviousChild.length, endPreviousChild.length+2);
                    //$log.debug(childrenLeftOfCursor);
                }
                let childrenRightOfCursor = content.substring(childrenLeftOfCursor.length, content.length);

                return functions.getTEIElementInformation(childrenLeftOfCursor, childrenRightOfCursor, lines, tags, teiInfo, false);
            },
            /**
             * This function returns an array with every information about the current TEI Element of the caret position in the transcript
             *
             * @param leftOfCursor
             * @param rightOfCursor
             * @param lines
             * @param tags
             * @param teiInfo
             * @param computeParent
             * @returns object
             */
            getTEIElementInformation: function(leftOfCursor, rightOfCursor, lines, tags, teiInfo, computeParent) {
                //console.log('getTEIElementInformation');
                if(!leftOfCursor || !rightOfCursor) { return null; }
                // $log.debug(leftOfCursor);
                // $log.debug(rightOfCursor);

                /* GLOBAL INFORMATION:
                 * - Positions shouldn't depend on the caret position. It should be absolute values, not relative.
                 * - endPos should be an absolute value, not relative to tagPos
                 */
                let content = leftOfCursor+rightOfCursor,
                    teiElement = {
                        name: null,
                        type: null,
                        attributes: [],
                        startTag: {
                            start: {
                                index: null,
                                row: null,
                                column: null
                            },
                            end: {
                                index: null, // Refers to the last character (meaning ">"), not the first after
                                row: null,
                                column: null
                            },
                            content: null
                        },
                        endTag: {
                            start: {
                                index: null,
                                row: null,
                                column: null
                            },
                            end: {
                                index: null, // Refers to the last character (meaning ">"), not the first after
                                row: null,
                                column: null
                            },
                            content: null
                        },
                        content: null,
                        parent: null,
                        parents: [],
                        children: [],
                        parentLeftOfCursor: null,
                        parentRightOfCursor: null
                    },
                    startExtraCounter = 0;

                /* -------------------------------------------------------------------------------------------------- */
                /* -- This part computes the teiElement name: -- */
                /* -------------------------------------------------------------------------------------------------- */
                if(leftOfCursor.lastIndexOf("</") > leftOfCursor.lastIndexOf(">")) {
                    // The caret is inside an end tag > we use this tag as current tag
                    teiElement.startTag.content = leftOfCursor.substring(leftOfCursor.lastIndexOf("</"), leftOfCursor.length)+rightOfCursor.substring(0, rightOfCursor.indexOf(">")+1);
                    teiElement = functions.computeFromEndTag(teiElement, leftOfCursor, rightOfCursor, content);
                } else if(leftOfCursor.lastIndexOf("<") > leftOfCursor.lastIndexOf(">")) {
                    // The caret is inside a tag > we use this tag as current tag
                    teiElement.startTag.content = leftOfCursor.substring(leftOfCursor.lastIndexOf("<"), leftOfCursor.length)+rightOfCursor.substring(0, rightOfCursor.indexOf(">")+1);
                    if(teiElement.startTag.content[1] === "/") {
                        /* Tag is an endTag */
                        teiElement = functions.computeFromEndTag(teiElement, leftOfCursor, rightOfCursor, content);
                    } else if(teiElement.startTag.content[teiElement.startTag.content.length-2] === "/") {
                        /* Tag is a singleTag */
                        teiElement = functions.computeFromSingleTag(teiElement, leftOfCursor, rightOfCursor, content);
                    } else {
                        /* Tag is a startTag*/
                        teiElement = functions.computeFromStartTag(teiElement, leftOfCursor, rightOfCursor, content);
                    }

                } else if (leftOfCursor.indexOf("<") !== -1) {
                    $log.debug('inside tag');
                    // The caret is outside a tag, but there is at least one tag before -> we use this nearest tag as current teiElement
                    /*
                     * <\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[\^'">\s]+))?)+\s*|\s*)\/?>/g
                     * Regex from http://haacked.com/archive/2004/10/25/usingregularexpressionstomatchhtml.aspx/
                     */
                    let matchList = leftOfCursor.match(/<\/?\w+((\s+[a-zA-Z0-9:_]+(\s*=\s*(?:".*?"|'.*?'|[\^'">\s]+))?)+\s*|\s*)\/?>/g);
                    //$log.debug(matchList);
                    if(matchList !== null && matchList.length > 0) {
                        matchList = matchList.reverse();

                        /* We list each tag in the text before the cursor,
                         * beginning by the closer of the cursor.
                         * Aim is to find the first unclosed tag
                         */
                        let carriedList = [];
                        $.each(matchList, (function(index, value) {
                            if(value[1] === "/") {
                                /* Match with end tag */
                                // We place the tagName in the "carriedList" if it's the end
                                carriedList.push(value.substring(2,(value.length-1)).replace(/\s/g,''));
                            } else if(value[value.length-2] !== "/") {
                                /* Match with start tag, escaping alone tags */
                                // Starting by extracting the tag name from the tag
                                let valueTagName = value.replace(/<([a-zA-Z]+).*>/g, '$1');
                                if(carriedList.indexOf(valueTagName) !== -1) {
                                    // If the tag name is in the carried list, the tag has been closed, we slice it
                                    carriedList.slice(carriedList.indexOf(valueTagName), 1);
                                } else {
                                    // Else, it is not closed : this is it
                                    teiElement.name = valueTagName;
                                    return false;
                                }
                            }
                        }));
                    }

                    if(teiElement.name === null) {
                        teiElement = null;
                    } else {
                        let startContentFull        = content.substring(leftOfCursor.lastIndexOf("<"+teiElement.name), content.length);
                        teiElement.startTag.content = startContentFull.substring(0, startContentFull.indexOf(">")+1);
                        teiElement                  = functions.computeFromStartTag(teiElement, leftOfCursor, rightOfCursor, content);
                    }
                } else {
                    teiElement = null;
                }
                /* -------------------------------------------------------------------------------------------------- */

                /* -------------------------------------------------------------------------------------------------- */
                /* -- If a TEI element has been identified, we compute the relative information -- */
                /* -------------------------------------------------------------------------------------------------- */
                if(teiElement !== null) {
                    /* -------------------------------------------------------------------------------------------------
                     * This part computes the start tag's position
                     ------------------------------------------------------------------------------------------------ */
                    if(lines !== null) {
                        if (teiElement.type === "standard") {
                            startExtraCounter = 1;
                        } else if (teiElement.type === "single") {
                            startExtraCounter = 0;
                        }
                        let tagPosStart = teiElement.startTag.start.index;
                        for (let kLine in lines) {
                            let line = lines[kLine];
                            if (line.length <= tagPosStart) {
                                tagPosStart -= line.length;
                            } else {
                                let afterTagPos                     = line.substring(tagPosStart + teiElement.name.length, line.length);
                                let endTagFull                      = afterTagPos.indexOf('>');
                                teiElement.startTag.start.row       = parseInt(kLine);
                                teiElement.startTag.start.column    = parseInt(tagPosStart);
                                teiElement.startTag.end.row         = parseInt(kLine);
                                teiElement.startTag.end.column      = parseInt(tagPosStart + teiElement.name.length + endTagFull + startExtraCounter);
                                break;
                            }
                        }
                    }    
                    /* ---------------------------------------------------------------------------------------------- */

                    /* -------------------------------------------------------------------------------------------------
                     * This part returns end tag's information
                     ------------------------------------------------------------------------------------------------ */
                    if (teiElement.type === "standard" && lines !== null) {
                        let endPosStart = teiElement.endTag.start.index;
                        for (let kLine in lines) {
                            let line = lines[kLine];
                            if (line.length <= endPosStart) {
                                endPosStart -= line.length;
                            } else {
                                teiElement.endTag.start.row     = parseInt(kLine);
                                teiElement.endTag.start.column  = parseInt(endPosStart);
                                teiElement.endTag.end.row       = parseInt(kLine);
                                teiElement.endTag.end.column    = parseInt(endPosStart + teiElement.name.length + 3);
                                break;
                            }
                        }
                    }
                    /* ---------------------------------------------------------------------------------------------- */

                    /* -------------------------------------------------------------------------------------------------
                     * This part returns the content of the TEI element
                     ------------------------------------------------------------------------------------------------ */
                    if (teiElement.type === "standard") {
                        teiElement.content = content.substring(teiElement.startTag.end.index + 1, teiElement.endTag.start.index);
                    }
                    /* ---------------------------------------------------------------------------------------------- */

                    /* -------------------------------------------------------------------------------------------------
                     * This part computes the start tag's attributes
                     ------------------------------------------------------------------------------------------------ */
                    let attributesList = teiElement.startTag.content.match(/(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g);
                    for (let kAttribute in attributesList) {
                        let attributeFull = attributesList[kAttribute];
                        let attribute = attributeFull.replace(/(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g, '$1');
                        let value = attributeFull.replace(/(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/g, '$2');
                        teiElement.attributes.push({attribute: attribute, value: value});
                    }
                    teiElement.attributes = functions.extractAttributes(teiElement.startTag.content);
                    /* ---------------------------------------------------------------------------------------------- */

                    /* -------------------------------------------------------------------------------------------------
                     * This part compiles the parents of the tag
                     ------------------------------------------------------------------------------------------------ */
                    // If TEI Element can have parents, we compute the parents
                    if (tags[teiElement.name] !== undefined && tags[teiElement.name].btn !== undefined && tags[teiElement.name].btn.restrict_to_root === true) {
                        teiElement.parent = null;
                        teiElement.parents = [];
                    } else if (computeParent === true) {
                        teiElement.parent = this.getTEIElementInformation(teiElement.parentLeftOfCursor, teiElement.parentRightOfCursor, lines, tags, teiInfo, true);
                        teiElement.parents = functions.getTEIElementParents(teiElement.parent, []);
                        teiElement.parents.push(teiElement.parent);

                        if (tags[teiElement.name].btn !== undefined && tags[teiElement.name].btn.allow_root === true && teiElement.parent === null) {
                            teiElement.parent = null;
                            teiElement.parents = [];
                        }
                    }
                    /* ---------------------------------------------------------------------------------------------- */

                    /* -------------------------------------------------------------------------------------------------
                     * This part compiles the children of the tag
                     ------------------------------------------------------------------------------------------------ */
                    if (teiElement.content && !!teiInfo[teiElement.name] && teiInfo[teiElement.name]["textAllowed"] === false) {
                        //$log.debug(teiElement.content);
                        teiElement.children = functions.computeChildren(teiElement, content, lines, tags, teiInfo);
                    } else if (teiElement.content && !!teiInfo[teiElement.name] && teiInfo[teiElement.name]["textAllowed"] === true) {
                        teiElement.children = null;
                    } else {
                        teiElement.children = null;
                    }
                    /* ---------------------------------------------------------------------------------------------- */
                }
                //console.log(teiElement);
                return teiElement;
            },
            getTEIElementParents(teiElement, parents) {
                if(teiElement && teiElement.parent !== null) {
                    if(teiElement.parent.parent !== null) {parents = this.getTEIElementParents(teiElement.parent, parents);}
                    parents.push(teiElement.parent);
                }
                return parents;
            },
            getTeiInfo: function() {
                return $http.get(
                    $rootScope.webapp.resources+"teiInfo.json"
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            },
            buildListTagToolbar: function(transcriptArea, teiInfo, item, transcriptConfig) {
                let htmlToReturn = "";

                /* -------------------------------------------------------------------------------------------------- */
                /* Starting by computing the tags list */
                /* -------------------------------------------------------------------------------------------------- */
                let listTags = [];

                for (let iT in transcriptArea.toolbar.tags) {
                    let button = transcriptArea.toolbar.tags[iT];

                    if(button.btn && button.btn.btn_group === item.id && button.btn.view === true && (transcriptConfig.isExercise === false || (transcriptConfig.isExercise === true && $filter('contains')(transcriptConfig.tagsList, button.btn.id)))) {
                        listTags.push(button);
                    }
                }
                if(transcriptArea.toolbar.tags[item.id] !== undefined) {
                    for (let iG in transcriptArea.toolbar.tags[item.id].btn.group_children) {
                        let subGroup = transcriptArea.toolbar.tags[item.id].btn.group_children[iG];
                        listTags.push(transcriptArea.toolbar.groups[subGroup]);
                    }
                } else if(transcriptArea.toolbar.groups[item.id] !== undefined) {
                    for (let iG in transcriptArea.toolbar.groups) {
                        if(transcriptArea.toolbar.groups[iG].parent === item.id) {
                            //We add the group
                            listTags.push(transcriptArea.toolbar.groups[iG]);
                            //We add the tags of the group
                            for (let iT in transcriptArea.toolbar.tags) {
                                let button = transcriptArea.toolbar.tags[iT];
                                if(button.btn && button.btn.btn_group === transcriptArea.toolbar.groups[iG].id && button.btn.view === true && (transcriptConfig.isExercise === false || (transcriptConfig.isExercise === true && $filter('contains')(transcriptConfig.tagsList, button.btn.id)))) {
                                    listTags.push(button);
                                }
                            }
                        }
                    }
                }

                listTags = $filter('orderBy')(listTags, 'order');
                /* End: Computing list tags ------------------------------------------------------------------------- */

                /* -------------------------------------------------------------------------------------------------- */
                /* Creation of the DOM */
                /* -------------------------------------------------------------------------------------------------- */
                for (let iT in listTags) {
                    let button = listTags[iT];

                    if(button.btn !== undefined && button.btn.btn_group === item.id) {
                        let btnClass = "", btnContent = "", circleColor = "";

                        if(button.btn.enabled === false) {
                            btnClass += "disabled";
                        }

                        if(button.btn.label === false) {
                            btnContent += teiInfo[button.xml.name].doc.gloss[0].content;
                        } else if(button.btn.label !== false) {
                            btnContent += button.btn.label;
                        }

                        if(button.btn.enabled === true) {
                            circleColor += "red-color";
                        }

                        if(button.btn.separator_before === true && htmlToReturn !== "") {
                            htmlToReturn += '<li class="dropdown-divider"></li>';
                        }

                        htmlToReturn += '<li class="dropdown-item" ng-mouseenter="transcriptArea.toolbar.mouseOverLvl2 = \''+ button.xml.name +'\'" ng-mouseleave="transcriptArea.toolbar.mouseOverLvl2 = null" ng-if="(transcriptConfig.isExercise === false || (transcriptConfig.isExercise === true && transcriptConfig.tagsList | contains:\''+button.btn.id+'\'))">' +
                                        '   <a ng-click="transcriptArea.ace.addTag(\''+button.btn.id+'\', \''+ $filter('internalAttributesRender')(button.xml.attributes) +'\')" title="'+ button.btn.title +'" class="'+btnClass+'" ng-class="{\'disabled\': button.btn.enabled == false}">' +
                                        '       <i class="'+ button.btn.icon +'"></i> ' +
                                                $filter('ucFirstStrict')(btnContent) +
                                        '   </a>' +
                                        '</li>';
                    } else {
                        let subGroup = button;
                        let subGroupHtmlToReturn = "";

                        for (let iB in transcriptArea.toolbar.tags) {
                            let subButton = transcriptArea.toolbar.tags[iB];
                            if (subButton.btn && subButton.btn.btn_group === subGroup.id && $filter('filter')(listTags, {btn: {id: subButton.btn.id}}).length > 0) {
                                let btnClass = "", btnContent = "", circleColor = "";

                                if (subButton.btn.enabled === false) {
                                    btnClass += "disabled";
                                }

                                if (subButton.btn.label === false) {
                                    btnContent += teiInfo[subButton.btn.id].doc.gloss[0].content;
                                } else if (subButton.btn.label !== false) {
                                    btnContent += subButton.btn.label;
                                }

                                if (subButton.btn.enabled === true) {
                                    circleColor += "red-color";
                                }
                                subGroupHtmlToReturn += '   <li class="dropdown-item" ng-mouseenter="transcriptArea.toolbar.mouseOverLvl2 = \'' + subButton.xml.name + '\'" ng-mouseleave="transcriptArea.toolbar.mouseOverLvl2 = null">' +
                                                '               <a ng-click="transcriptArea.ace.addTag(\'' + subButton.btn.id + '\', \'' + $filter('internalAttributesRender')(subButton.xml.attributes) + '\')" title="' + subButton.btn.title + '" class="' + btnClass + '"  ng-class="{\'disabled\': button.btn.enabled == false}">' +
                                                '                   <i class="' + subButton.btn.icon + '"></i> ' +
                                                                    $filter('ucFirstStrict')(btnContent) +
                                                '               </a>' +
                                                '           </li>';
                            }
                        }

                        if(subGroupHtmlToReturn !== "") {
                            if(subGroup.separator_before === true && htmlToReturn !== "") {
                                htmlToReturn += '<li class="dropdown-divider"></li>';
                            }
                            htmlToReturn += '<li class="dropdown-submenu" id="' + subGroup.id + '">' +
                                '   <a class="dropdown-item" tabindex="-1">' + subGroup.name + '</a>' +
                                '   <ul class="dropdown-menu">' +
                                    subGroupHtmlToReturn +
                                '   </ul>' +
                                '</li>';
                        }
                    }
                }
                return htmlToReturn;
                /* End: Creation of the DOM ------------------------------------------------------------------------- */
            }
        };
        return functions;
    })
;