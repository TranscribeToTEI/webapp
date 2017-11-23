'use strict';

angular.module('transcript.service.transcript', ['ui.router'])

    .service('TranscriptService', function($http, $rootScope) {
        let functions = {
            getTranscripts: function() {
                return $http.get(
                    $rootScope.api+"/transcripts"
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },
            getTranscriptsByStatus: function(status) {
                return $http.get(
                    $rootScope.api+"/transcripts?status="+status
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },
            getTranscript: function(id) {
                return $http.get(
                    $rootScope.api+"/transcripts/"+id
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },
            patchTranscript: function(form, id) {
                return $http.patch(
                    $rootScope.api+"/transcripts/"+id,
                    form
                ).then(function(response) {
                    console.log(response);
                    return response;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },
            getTranscriptRights: function(user) {
                let role;
                console.log(user);

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
             * This function encodes the TEI XML in HTML for live rendering.
             *
             * More information about the buttons, the tags and their rendering into toolbar.yml
             *
             * @param encodeLiveRender string
             * @param buttons array
             * @param microObject
             * @returns string
             */
            encodeHTML: function(encodeLiveRender, buttons, microObject) {
                let TS = this;
                let matchList = encodeLiveRender.match(/<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[\^'">\s]+))?)+\s*|\s*)\/?>/g);
                $.each(matchList, (function(index, value) {
                    let valueTagName = value.replace(/<([a-zA-Z]+).*>/g, '$1');
                    if(value[1] === "/") {
                        /* Match with end tag */
                        /* End tags need special regex*/
                        valueTagName = value.replace(/<\/([a-zA-Z]+).*>/g, '$1');
                        if(buttons[valueTagName] !== undefined) {
                            encodeLiveRender = encodeLiveRender.replace(value, TS.tagConstruction(buttons[valueTagName], "endTag", microObject));
                        }
                    } else if(value[value.length-2] === "/") {
                        /* Match with single tag */
                        if(buttons[valueTagName] !== undefined) {
                            // console.log(valueTagName);
                            encodeLiveRender = encodeLiveRender.replace(value, TS.tagConstruction(buttons[valueTagName], "singleTag", microObject));
                        }
                    } else if(value[value.length-2] !== "/") {
                        /* Match with start tag, escaping single tags */
                        if(buttons[valueTagName] !== undefined) {
                            encodeLiveRender = encodeLiveRender.replace(value, TS.tagConstruction(buttons[valueTagName], "startTag", microObject));
                        }
                    }
                }));
                return encodeLiveRender;
            },
            tagConstruction: function(tag, type, microObject) {
                console.log(microObject);
                let attributesHtml = "";
                if(tag.html.attributes !== undefined) {
                    for(let attribute in tag.html.attributes) {
                        attributesHtml += " "+attribute+"=\""+tag.html.attributes[attribute]+"\"";
                    }
                }

                let construction = '',
                    bgColor = '';
                if(tag.btn.level === 1) {
                    bgColor = 'text-info';
                } else if(tag.btn.level === 2) {
                    bgColor = 'text-primary';
                }

                /* Icon content ------------------------------------------------------------------------------------- */
                if(microObject === true && tag.html.icon !== undefined && tag.html.icon.position === "before" && (type === "startTag" || type === "singleTag")) {
                    construction += ' <span class="'+bgColor+'"><i class="'+tag.btn.icon+'" title="'+tag.btn.title+'"></i></span> ';
                }
                if(microObject === true && tag.html.icon !== undefined && tag.html.icon.position === "append" && type === "endTag") {
                    construction += ' <span class="'+bgColor+'"><i class="'+tag.btn.icon+'" title="'+tag.btn.title+'"></i></span> ';
                }
                /* Icon content ------------------------------------------------------------------------------------- */

                if(tag.html.marker === true && type === "endTag") {
                    if(tag.btn.id === 'choice') {
                        construction += ']';
                    } else if(tag.btn.id === '') {

                    }
                }

                /* Tag content -------------------------------------------------------------------------------------- */
                if(type === "endTag") {
                    construction += "</"+tag.html.name+">";
                } else if(type === "startTag") {
                    construction +=  "<"+tag.html.name+attributesHtml+">";
                } else if(type === "singleTag") {
                    if(tag.html.unique === true) {
                        construction +=  "<"+tag.html.name+attributesHtml+" />";
                    } else {
                        construction +=  "<"+tag.html.name+attributesHtml+">";
                        if(microObject === true && tag.html.icon !== undefined && (tag.html.icon.position === "prepend" || tag.html.icon.position === "append")) {
                            construction += ' <span class="'+bgColor+'"><i class="'+tag.btn.icon+'" title="'+tag.btn.title+'"></i></span> ';
                        }
                        construction += "</"+tag.html.name+">";
                    }
                }
                /* Tag content -------------------------------------------------------------------------------------- */

                if(tag.html.marker === true && type === "startTag") {
                    if(tag.btn.id === 'choice') {
                        construction += '[';
                    } else if(tag.btn.id === '') {

                    }
                }

                /* Icon content ------------------------------------------------------------------------------------- */
                if(microObject === true && tag.html.icon !== undefined && tag.html.icon.position === "prepend" && type === "startTag") {
                    construction += ' <span class="'+bgColor+'"><i class="'+tag.btn.icon+'" title="'+tag.btn.title+'"></i></span> ';
                }
                if(microObject === true && tag.html.icon !== undefined && tag.html.icon.position === "after" && (type === "endTag" || type === "singleTag")) {
                    construction += ' <span class="'+bgColor+'"><i class="'+tag.btn.icon+'" title="'+tag.btn.title+'"></i></span> ';
                }
                /* Icon content ------------------------------------------------------------------------------------- */

                //console.log(construction);
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
             * @param tpTag
             * @param order
             * @returns integer|null
             */
            getTagPos: function(tpContent, tpTag, order) {
                let tagPosA = null, tagPosB = null, tagPosC = null;
                if(order === "ASC") {
                    tagPosA = tpContent.indexOf("<"+tpTag+" ");
                    tagPosB = tpContent.indexOf("<"+tpTag+"/>");
                    tagPosC = tpContent.indexOf("<"+tpTag+">");
                } else if(order === "DESC") {
                    tagPosA = tpContent.lastIndexOf("<"+tpTag+" ");
                    tagPosB = tpContent.lastIndexOf("<"+tpTag+"/>");
                    tagPosC = tpContent.lastIndexOf("<"+tpTag+">");
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
                let iTagPos = functions.getTagPos(content.substring(0, relativePosition), teiElement.name, "DESC");
                let iPortion = content.substring(iTagPos, relativePosition);

                if(iPortion.indexOf("</"+teiElement.name+">") !== -1) {
                    // Meaning there is another similar tag as child
                    let list = iPortion.match(new RegExp("</"+teiElement.name+">",'g'));
                    return functions.computeStartOfTag(teiElement.name, content, iTagPos, carriedCounter+list.length-1);
                } else if(carriedCounter > 0) {
                    // If the carried list is not empty
                    return functions.computeStartOfTag(teiElement.name, content, iTagPos, carriedCounter-1);
                } else {
                    // Else, we return the tag pos
                    return iTagPos;
                }
            },
            /**
             * This function computes positions of the start tag and end tag, from the end position
             *
             * @param teiElement
             * @param leftOfCursor
             * @param rightOfCursor
             * @param content
             * 
             * @returns object
             */
            computeFromEndTag: function(teiElement, leftOfCursor, rightOfCursor, content) {
                console.log('computeFromEndTag');
                teiElement.name = teiElement.startTag.content.replace(/<\/([a-zA-Z]+)>/g, '$1');

                if(teiElement.name) {
                    teiElement.type                 = "standard"; // -> This is an end tag, can't be a single tag
                    teiElement.endTag.start.index   = leftOfCursor.lastIndexOf("<");
                    teiElement.startTag.start.index = functions.computeStartOfTag(teiElement, content, teiElement.endTag.start.index, 0);

                    if(teiElement.startTag.start.index !== null) {
                        teiElement.parentLeftOfCursor = leftOfCursor.substring(0, teiElement.startTag.start.index);
                        teiElement.parentRightOfCursor = leftOfCursor.substring(teiElement.startTag.start.index, leftOfCursor.length)+rightOfCursor;
                    }
                }

                return teiElement;
            },
            /**
             * This function computes positions of the start tag and end tag, from the start position
             *
             * @param teiElement
             * @param leftOfCursor
             * @param rightOfCursor
             * @param content
             * @returns object
             */
            computeFromStartTag: function(teiElement, leftOfCursor, rightOfCursor, content) {
                console.log('computeFromStartTag');
                teiElement.name = teiElement.startTag.content.replace(/<([a-zA-Z]+).*>/g, '$1');

                if(teiElement.name) {
                    if(teiElement.startTag.content.substring(teiElement.startTag.content.length-2, teiElement.startTag.content.length) === "/>") {
                        teiElement.type = "single";
                    } else {
                        teiElement.type = "standard";
                    }
                    console.log(teiElement.type);

                    if(teiElement.type === "single") {
                        teiElement.startTag.start.index = leftOfCursor.lastIndexOf('<');
                    } else if(teiElement.type === "standard") {
                        teiElement.startTag.start.index = functions.getTagPos(leftOfCursor, teiElement.name, "DESC");
                        console.log(teiElement.startTag.start.index);
                    }

                    if(teiElement.startTag.start.index !== null) {
                        if(teiElement.type === "standard") {
                            teiElement.endTag.start.index = functions.computeEndOfTag(teiElement, leftOfCursor, rightOfCursor, content, teiElement.startTag.start.index, 0);
                        }

                        teiElement.parentLeftOfCursor = leftOfCursor.substring(0, teiElement.startTag.start.index);
                        console.log(teiElement.parentLeftOfCursor);
                        teiElement.parentRightOfCursor = leftOfCursor.substring(teiElement.startTag.start.index, leftOfCursor.length)+rightOfCursor;
                        console.log(teiElement.parentRightOfCursor);
                    }
                }

                return teiElement;
            },
            computeFromSingleTag: function(teiElement, leftOfCursor, rightOfCursor) {
                console.log('computeFromSingleTag');
                teiElement.name = teiElement.startTag.content.replace(/<([a-zA-Z]+).*\/>/g, '$1');

                if(teiElement.name) {
                    teiElement.type = "single";
                    teiElement.startTag.start.index = leftOfCursor.lastIndexOf('<');

                    if(teiElement.startTag.start.index) {
                        teiElement.parentLeftOfCursor = leftOfCursor.substring(0, teiElement.startTag.start.index);
                        console.log(teiElement.parentLeftOfCursor);
                        teiElement.parentRightOfCursor = leftOfCursor.substring(teiElement.startTag.start.index, leftOfCursor.length)+rightOfCursor;
                        console.log(teiElement.parentRightOfCursor);
                    }
                }

                return teiElement;
            },
            computeChildren: function(tagPos, fullContent) {
                // Reste à faire cette partie
            },
            registerChild: function(content, type) {
                teiElement.children.push({content: content, type: type});
            },
            getTEIElementStartTagEndIndex: function(teiElement, content) {
                let afterTagPosContent  = content.substring(teiElement.startTag.start.index + 1 + teiElement.name.length, content.length);
                let tagPosFullContent   = afterTagPosContent.indexOf('>');
                return teiElement.startTag.start.index + 1 + teiElement.name.length + tagPosFullContent;
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
                if(!(!!leftOfCursor || !!rightOfCursor)) { return null; }
                // console.log(teiInfo);
                // console.log(leftOfCursor);
                // console.log(rightOfCursor);

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
                        teiElement = functions.computeFromSingleTag(teiElement, leftOfCursor, rightOfCursor);
                    } else {
                        /* Tag is a startTag*/
                        teiElement = functions.computeFromStartTag(teiElement, leftOfCursor, rightOfCursor, content);
                    }

                } else if (leftOfCursor.indexOf("<") !== -1) {
                    // The caret is outside a tag, but there is at least one tag before -> we use this nearest tag as current teiElement
                    /*
                     * <\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[\^'">\s]+))?)+\s*|\s*)\/?>/g
                     * Regex from http://haacked.com/archive/2004/10/25/usingregularexpressionstomatchhtml.aspx/
                     */
                    let matchList = leftOfCursor.match(/<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[\^'">\s]+))?)+\s*|\s*)\/?>/g);
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
                        teiElement.type = "standard";
                        teiElement.startTag.start.index = functions.getTagPos(leftOfCursor, teiElement, "DESC");

                        let startContentFull = content.substring(teiElement.startTag.start.index, content.length);
                        teiElement.startTag.content = startContentFull.substring(0, startContentFull.indexOf(">")+1);
                        teiElement = functions.computeFromStartTag(teiElement, leftOfCursor, rightOfCursor, content);

                        teiElement.parentLeftOfCursor = leftOfCursor.substring(0, leftOfCursor.lastIndexOf(teiElement.name)-1);
                        teiElement.parentRightOfCursor = leftOfCursor.substring(leftOfCursor.lastIndexOf(teiElement.name)-1, leftOfCursor.length)+rightOfCursor;
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
                            let afterTagPos = line.substring(tagPosStart + teiElement.name.length, line.length);
                            let endTagFull = afterTagPos.indexOf('>');
                            teiElement.startTag.start.row = parseInt(kLine);
                            teiElement.startTag.start.column = parseInt(tagPosStart);
                            teiElement.startTag.end.row = parseInt(kLine);
                            teiElement.startTag.end.column = parseInt(tagPosStart + teiElement.name.length + endTagFull + startExtraCounter);
                            teiElement.startTag.end.index = functions.getTEIElementStartTagEndIndex(teiElement, content);

                            if (teiElement.startTag.content === null) {
                                teiElement.startTag.content = line.substring(tagPosStart, tagPosStart + teiElement.name.length + endTagFull + startExtraCounter);
                            }
                            break;
                        }
                    }
                    /* ---------------------------------------------------------------------------------------------- */

                    /* -------------------------------------------------------------------------------------------------
                     * This part returns end tag's information
                     ------------------------------------------------------------------------------------------------ */
                    if (teiElement.type === "standard") {
                        let endPosStart = teiElement.endTag.start.index;
                        for (let kLine in lines) {
                            let line = lines[kLine];
                            if (line.length <= endPosStart) {
                                endPosStart -= line.length;
                            } else {
                                teiElement.endTag.start.row = parseInt(kLine);
                                teiElement.endTag.start.column = parseInt(endPosStart);
                                teiElement.endTag.end.row = parseInt(kLine);
                                teiElement.endTag.end.column = parseInt(endPosStart + teiElement.name.length + 3);
                                teiElement.endTag.end.index = parseInt(teiElement.endTag.start.index + teiElement.name.length + 3);
                                teiElement.endTag.content = line.substring(endPosStart, endPosStart + teiElement.name.length + 3);
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
                    /* ---------------------------------------------------------------------------------------------- */

                    /* -------------------------------------------------------------------------------------------------
                     * This part compiles the parents of the tag
                     ------------------------------------------------------------------------------------------------ */
                    // If TEI Element can have parents, we compute the parents
                    if (tags[teiElement.name] !== undefined && tags[teiElement.name].btn.restrict_to_root === false && computeParent === true) {
                        teiElement.parent = this.getTEIElementInformation(teiElement.parentLeftOfCursor, teiElement.parentRightOfCursor, lines, tags, teiInfo, true);
                        teiElement.parents = functions.getTEIElementParents(teiElement.parent, []);
                        teiElement.parents.push(teiElement.parent);

                        if (tags[teiElement.name].btn.allow_root === true && teiElement.parent.name === null) {
                            teiElement.parent = null;
                            teiElement.parents = [];
                        }
                    } else if (tags[teiElement.name] !== undefined && tags[teiElement.name].btn.restrict_to_root === true) {
                        teiElement.parent = null;
                        teiElement.parents = [];
                    }
                    /* ---------------------------------------------------------------------------------------------- */

                    /* -------------------------------------------------------------------------------------------------
                     * This part compiles the children of the tag
                     ------------------------------------------------------------------------------------------------ */
                    if (teiElement.content && !!teiInfo[teiElement.name] && teiInfo[teiElement.name]["textAllowed"] === false) {
                        //children = functions.computeChildren(teiElement.content.indexOf("<")+1, teiElement.content);
                        teiElement.children = null;
                    } else if (teiElement.content && !!teiInfo[teiElement.name] && teiInfo[teiElement.name]["textAllowed"] === true) {
                        teiElement.children = null;
                    } else {
                        teiElement.children = null;
                    }
                    /* ---------------------------------------------------------------------------------------------- */
                }
                console.log(teiElement);
                return teiElement;
            },
            getTEIElementParents(teiElement, parents) {
                if(teiElement.parent !== null) {
                    if(teiElement.parent.parent !== null) {parents = this.getTEIElementParents(teiElement.parent, parents);}
                    parents.push(teiElement.parent);
                }
                return parents;
            },
            getTeiInfo: function() {
                return $http.get(
                    $rootScope.api+"/model?elements=true&info=full"
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            }
        };
        return functions;
    })
;