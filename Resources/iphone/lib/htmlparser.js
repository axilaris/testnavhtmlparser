exports = {};

(function() {
    function runningInNode() {
        return "function" == typeof require && "object" == typeof exports && "object" == typeof module && "string" == typeof __filename && "string" == typeof __dirname;
    }
    function Parser(handler, options) {
        this._options = options ? options : {};
        void 0 == this._options.includeLocation && (this._options.includeLocation = false);
        this.validateHandler(handler);
        this._handler = handler;
        this.reset();
    }
    function RssHandler(callback) {
        RssHandler.super_.call(this, callback, {
            ignoreWhitespace: true,
            verbose: false,
            enforceEmptyTags: false
        });
    }
    function DefaultHandler(callback, options) {
        this.reset();
        this._options = options ? options : {};
        void 0 == this._options.ignoreWhitespace && (this._options.ignoreWhitespace = false);
        void 0 == this._options.verbose && (this._options.verbose = true);
        void 0 == this._options.enforceEmptyTags && (this._options.enforceEmptyTags = true);
        "function" == typeof callback && (this._callback = callback);
    }
    function inherits(ctor, superCtor) {
        var tempCtor = function() {};
        tempCtor.prototype = superCtor.prototype;
        ctor.super_ = superCtor;
        ctor.prototype = new tempCtor();
        ctor.prototype.constructor = ctor;
    }
    if (!runningInNode()) {
        if (this.Tautologistics) {
            if (this.Tautologistics.NodeHtmlParser) return;
        } else this.Tautologistics = {};
        this.Tautologistics.NodeHtmlParser = {};
        exports = this.Tautologistics.NodeHtmlParser;
    }
    var ElementType = {
        Text: "text",
        Directive: "directive",
        Comment: "comment",
        Script: "script",
        Style: "style",
        Tag: "tag"
    };
    Parser._reTrim = /(^\s+|\s+$)/g;
    Parser._reTrimComment = /(^\!--|--$)/g;
    Parser._reWhitespace = /\s/g;
    Parser._reTagName = /^\s*(\/?)\s*([^\s\/]+)/;
    Parser._reAttrib = /([^=<>\"\'\s]+)\s*=\s*"([^"]*)"|([^=<>\"\'\s]+)\s*=\s*'([^']*)'|([^=<>\"\'\s]+)\s*=\s*([^'"\s]+)|([^=<>\"\'\s\/]+)/g;
    Parser._reTags = /[\<\>]/g;
    Parser.prototype.parseComplete = function(data) {
        this.reset();
        this.parseChunk(data);
        this.done();
    };
    Parser.prototype.parseChunk = function(data) {
        this._done && this.handleError(new Error("Attempted to parse chunk after parsing already done"));
        this._buffer += data;
        this.parseTags();
    };
    Parser.prototype.done = function() {
        if (this._done) return;
        this._done = true;
        if (this._buffer.length) {
            var rawData = this._buffer;
            this._buffer = "";
            var element = {
                raw: rawData,
                data: this._parseState == ElementType.Text ? rawData : rawData.replace(Parser._reTrim, ""),
                type: this._parseState
            };
            (this._parseState == ElementType.Tag || this._parseState == ElementType.Script || this._parseState == ElementType.Style) && (element.name = this.parseTagName(element.data));
            this.parseAttribs(element);
            this._elements.push(element);
        }
        this.writeHandler();
        this._handler.done();
    };
    Parser.prototype.reset = function() {
        this._buffer = "";
        this._done = false;
        this._elements = [];
        this._elementsCurrent = 0;
        this._current = 0;
        this._next = 0;
        this._location = {
            row: 0,
            col: 0,
            charOffset: 0,
            inBuffer: 0
        };
        this._parseState = ElementType.Text;
        this._prevTagSep = "";
        this._tagStack = [];
        this._handler.reset();
    };
    Parser.prototype._options = null;
    Parser.prototype._handler = null;
    Parser.prototype._buffer = null;
    Parser.prototype._done = false;
    Parser.prototype._elements = null;
    Parser.prototype._elementsCurrent = 0;
    Parser.prototype._current = 0;
    Parser.prototype._next = 0;
    Parser.prototype._location = null;
    Parser.prototype._parseState = ElementType.Text;
    Parser.prototype._prevTagSep = "";
    Parser.prototype._tagStack = null;
    Parser.prototype.parseTagAttribs = function(elements) {
        var idxEnd = elements.length;
        var idx = 0;
        while (idxEnd > idx) {
            var element = elements[idx++];
            (element.type == ElementType.Tag || element.type == ElementType.Script || element.type == ElementType.style) && this.parseAttribs(element);
        }
        return elements;
    };
    Parser.prototype.parseAttribs = function(element) {
        if (element.type != ElementType.Script && element.type != ElementType.Style && element.type != ElementType.Tag) return;
        var tagName = element.data.split(Parser._reWhitespace, 1)[0];
        var attribRaw = element.data.substring(tagName.length);
        if (1 > attribRaw.length) return;
        var match;
        Parser._reAttrib.lastIndex = 0;
        while (match = Parser._reAttrib.exec(attribRaw)) {
            void 0 == element.attribs && (element.attribs = {});
            "string" == typeof match[1] && match[1].length ? element.attribs[match[1]] = match[2] : "string" == typeof match[3] && match[3].length ? element.attribs[match[3].toString()] = match[4].toString() : "string" == typeof match[5] && match[5].length ? element.attribs[match[5]] = match[6] : "string" == typeof match[7] && match[7].length && (element.attribs[match[7]] = match[7]);
        }
    };
    Parser.prototype.parseTagName = function(data) {
        if (null == data || "" == data) return "";
        var match = Parser._reTagName.exec(data);
        if (!match) return "";
        return (match[1] ? "/" : "") + match[2];
    };
    Parser.prototype.parseTags = function() {
        var bufferEnd = this._buffer.length - 1;
        while (Parser._reTags.test(this._buffer)) {
            this._next = Parser._reTags.lastIndex - 1;
            var tagSep = this._buffer.charAt(this._next);
            var rawData = this._buffer.substring(this._current, this._next);
            var element = {
                raw: rawData,
                data: this._parseState == ElementType.Text ? rawData : rawData.replace(Parser._reTrim, ""),
                type: this._parseState
            };
            var elementName = this.parseTagName(element.data);
            if (this._tagStack.length) if (this._tagStack[this._tagStack.length - 1] == ElementType.Script) {
                if ("/script" == elementName) this._tagStack.pop(); else if (0 != element.raw.indexOf("!--")) {
                    element.type = ElementType.Text;
                    if (this._elements.length && this._elements[this._elements.length - 1].type == ElementType.Text) {
                        var prevElement = this._elements[this._elements.length - 1];
                        prevElement.raw = prevElement.data = prevElement.raw + this._prevTagSep + element.raw;
                        element.raw = element.data = "";
                    }
                }
            } else if (this._tagStack[this._tagStack.length - 1] == ElementType.Style) {
                if ("/style" == elementName) this._tagStack.pop(); else if (0 != element.raw.indexOf("!--")) {
                    element.type = ElementType.Text;
                    if (this._elements.length && this._elements[this._elements.length - 1].type == ElementType.Text) {
                        var prevElement = this._elements[this._elements.length - 1];
                        if ("" != element.raw) {
                            prevElement.raw = prevElement.data = prevElement.raw + this._prevTagSep + element.raw;
                            element.raw = element.data = "";
                        } else prevElement.raw = prevElement.data = prevElement.raw + this._prevTagSep;
                    } else "" != element.raw && (element.raw = element.data = element.raw);
                }
            } else if (this._tagStack[this._tagStack.length - 1] == ElementType.Comment) {
                var rawLen = element.raw.length;
                if ("-" == element.raw.charAt(rawLen - 2) && "-" == element.raw.charAt(rawLen - 1) && ">" == tagSep) {
                    this._tagStack.pop();
                    if (this._elements.length && this._elements[this._elements.length - 1].type == ElementType.Comment) {
                        var prevElement = this._elements[this._elements.length - 1];
                        prevElement.raw = prevElement.data = (prevElement.raw + element.raw).replace(Parser._reTrimComment, "");
                        element.raw = element.data = "";
                        element.type = ElementType.Text;
                    } else element.type = ElementType.Comment;
                } else {
                    element.type = ElementType.Comment;
                    if (this._elements.length && this._elements[this._elements.length - 1].type == ElementType.Comment) {
                        var prevElement = this._elements[this._elements.length - 1];
                        prevElement.raw = prevElement.data = prevElement.raw + element.raw + tagSep;
                        element.raw = element.data = "";
                        element.type = ElementType.Text;
                    } else element.raw = element.data = element.raw + tagSep;
                }
            }
            if (element.type == ElementType.Tag) {
                element.name = elementName;
                if (0 == element.raw.indexOf("!--")) {
                    element.type = ElementType.Comment;
                    delete element["name"];
                    var rawLen = element.raw.length;
                    if ("-" == element.raw.charAt(rawLen - 1) && "-" == element.raw.charAt(rawLen - 2) && ">" == tagSep) element.raw = element.data = element.raw.replace(Parser._reTrimComment, ""); else {
                        element.raw += tagSep;
                        this._tagStack.push(ElementType.Comment);
                    }
                } else if (0 == element.raw.indexOf("!") || 0 == element.raw.indexOf("?")) element.type = ElementType.Directive; else if ("script" == element.name) {
                    element.type = ElementType.Script;
                    "/" != element.data.charAt(element.data.length - 1) && this._tagStack.push(ElementType.Script);
                } else if ("/script" == element.name) element.type = ElementType.Script; else if ("style" == element.name) {
                    element.type = ElementType.Style;
                    "/" != element.data.charAt(element.data.length - 1) && this._tagStack.push(ElementType.Style);
                } else "/style" == element.name && (element.type = ElementType.Style);
                element.name && "/" == element.name.charAt(0) && (element.data = element.name);
            }
            if ("" != element.raw || element.type != ElementType.Text) {
                this._options.includeLocation && !element.location && (element.location = this.getLocation(element.type == ElementType.Tag));
                this.parseAttribs(element);
                this._elements.push(element);
                element.type != ElementType.Text && element.type != ElementType.Comment && element.type != ElementType.Directive && "/" == element.data.charAt(element.data.length - 1) && this._elements.push({
                    raw: "/" + element.name,
                    data: "/" + element.name,
                    name: "/" + element.name,
                    type: element.type
                });
            }
            this._parseState = "<" == tagSep ? ElementType.Tag : ElementType.Text;
            this._current = this._next + 1;
            this._prevTagSep = tagSep;
        }
        if (this._options.includeLocation) {
            this.getLocation();
            this._location.row += this._location.inBuffer;
            this._location.inBuffer = 0;
            this._location.charOffset = 0;
        }
        this._buffer = bufferEnd >= this._current ? this._buffer.substring(this._current) : "";
        this._current = 0;
        this.writeHandler();
    };
    Parser.prototype.getLocation = function(startTag) {
        var c, l = this._location, end = this._current - (startTag ? 1 : 0), chunk = startTag && 0 == l.charOffset && 0 == this._current;
        for (;end > l.charOffset; l.charOffset++) {
            c = this._buffer.charAt(l.charOffset);
            if ("\n" == c) {
                l.inBuffer++;
                l.col = 0;
            } else "\r" != c && l.col++;
        }
        return {
            line: l.row + l.inBuffer + 1,
            col: l.col + (chunk ? 0 : 1)
        };
    };
    Parser.prototype.validateHandler = function(handler) {
        if ("object" != typeof handler) throw new Error("Handler is not an object");
        if ("function" != typeof handler.reset) throw new Error("Handler method 'reset' is invalid");
        if ("function" != typeof handler.done) throw new Error("Handler method 'done' is invalid");
        if ("function" != typeof handler.writeTag) throw new Error("Handler method 'writeTag' is invalid");
        if ("function" != typeof handler.writeText) throw new Error("Handler method 'writeText' is invalid");
        if ("function" != typeof handler.writeComment) throw new Error("Handler method 'writeComment' is invalid");
        if ("function" != typeof handler.writeDirective) throw new Error("Handler method 'writeDirective' is invalid");
    };
    Parser.prototype.writeHandler = function(forceFlush) {
        forceFlush = !!forceFlush;
        if (this._tagStack.length && !forceFlush) return;
        while (this._elements.length) {
            var element = this._elements.shift();
            switch (element.type) {
              case ElementType.Comment:
                this._handler.writeComment(element);
                break;

              case ElementType.Directive:
                this._handler.writeDirective(element);
                break;

              case ElementType.Text:
                this._handler.writeText(element);
                break;

              default:
                this._handler.writeTag(element);
            }
        }
    };
    Parser.prototype.handleError = function(error) {
        if ("function" != typeof this._handler.error) throw error;
        this._handler.error(error);
    };
    inherits(RssHandler, DefaultHandler);
    RssHandler.prototype.done = function() {
        var feed = {};
        var feedRoot;
        var found = DomUtils.getElementsByTagName(function(value) {
            return "rss" == value || "feed" == value;
        }, this.dom, false);
        found.length && (feedRoot = found[0]);
        if (feedRoot) {
            if ("rss" == feedRoot.name) {
                feed.type = "rss";
                feedRoot = feedRoot.children[0];
                feed.id = "";
                try {
                    feed.title = DomUtils.getElementsByTagName("title", feedRoot.children, false)[0].children[0].data;
                } catch (ex) {}
                try {
                    feed.link = DomUtils.getElementsByTagName("link", feedRoot.children, false)[0].children[0].data;
                } catch (ex) {}
                try {
                    feed.description = DomUtils.getElementsByTagName("description", feedRoot.children, false)[0].children[0].data;
                } catch (ex) {}
                try {
                    feed.updated = new Date(DomUtils.getElementsByTagName("lastBuildDate", feedRoot.children, false)[0].children[0].data);
                } catch (ex) {}
                try {
                    feed.author = DomUtils.getElementsByTagName("managingEditor", feedRoot.children, false)[0].children[0].data;
                } catch (ex) {}
                feed.items = [];
                DomUtils.getElementsByTagName("item", feedRoot.children).forEach(function(item) {
                    var entry = {};
                    try {
                        entry.id = DomUtils.getElementsByTagName("guid", item.children, false)[0].children[0].data;
                    } catch (ex) {}
                    try {
                        entry.title = DomUtils.getElementsByTagName("title", item.children, false)[0].children[0].data;
                    } catch (ex) {}
                    try {
                        entry.link = DomUtils.getElementsByTagName("link", item.children, false)[0].children[0].data;
                    } catch (ex) {}
                    try {
                        entry.description = DomUtils.getElementsByTagName("description", item.children, false)[0].children[0].data;
                    } catch (ex) {}
                    try {
                        entry.pubDate = new Date(DomUtils.getElementsByTagName("pubDate", item.children, false)[0].children[0].data);
                    } catch (ex) {}
                    feed.items.push(entry);
                });
            } else {
                feed.type = "atom";
                try {
                    feed.id = DomUtils.getElementsByTagName("id", feedRoot.children, false)[0].children[0].data;
                } catch (ex) {}
                try {
                    feed.title = DomUtils.getElementsByTagName("title", feedRoot.children, false)[0].children[0].data;
                } catch (ex) {}
                try {
                    feed.link = DomUtils.getElementsByTagName("link", feedRoot.children, false)[0].attribs.href;
                } catch (ex) {}
                try {
                    feed.description = DomUtils.getElementsByTagName("subtitle", feedRoot.children, false)[0].children[0].data;
                } catch (ex) {}
                try {
                    feed.updated = new Date(DomUtils.getElementsByTagName("updated", feedRoot.children, false)[0].children[0].data);
                } catch (ex) {}
                try {
                    feed.author = DomUtils.getElementsByTagName("email", feedRoot.children, true)[0].children[0].data;
                } catch (ex) {}
                feed.items = [];
                DomUtils.getElementsByTagName("entry", feedRoot.children).forEach(function(item) {
                    var entry = {};
                    try {
                        entry.id = DomUtils.getElementsByTagName("id", item.children, false)[0].children[0].data;
                    } catch (ex) {}
                    try {
                        entry.title = DomUtils.getElementsByTagName("title", item.children, false)[0].children[0].data;
                    } catch (ex) {}
                    try {
                        entry.link = DomUtils.getElementsByTagName("link", item.children, false)[0].attribs.href;
                    } catch (ex) {}
                    try {
                        entry.description = DomUtils.getElementsByTagName("summary", item.children, false)[0].children[0].data;
                    } catch (ex) {}
                    try {
                        entry.pubDate = new Date(DomUtils.getElementsByTagName("updated", item.children, false)[0].children[0].data);
                    } catch (ex) {}
                    feed.items.push(entry);
                });
            }
            this.dom = feed;
        }
        RssHandler.super_.prototype.done.call(this);
    };
    DefaultHandler._emptyTags = {
        area: 1,
        base: 1,
        basefont: 1,
        br: 1,
        col: 1,
        frame: 1,
        hr: 1,
        img: 1,
        input: 1,
        isindex: 1,
        link: 1,
        meta: 1,
        param: 1,
        embed: 1
    };
    DefaultHandler.reWhitespace = /^\s*$/;
    DefaultHandler.prototype.dom = null;
    DefaultHandler.prototype.reset = function() {
        this.dom = [];
        this._done = false;
        this._tagStack = [];
        this._tagStack.last = function() {
            return this.length ? this[this.length - 1] : null;
        };
    };
    DefaultHandler.prototype.done = function() {
        this._done = true;
        this.handleCallback(null);
    };
    DefaultHandler.prototype.writeTag = function(element) {
        this.handleElement(element);
    };
    DefaultHandler.prototype.writeText = function(element) {
        if (this._options.ignoreWhitespace && DefaultHandler.reWhitespace.test(element.data)) return;
        this.handleElement(element);
    };
    DefaultHandler.prototype.writeComment = function(element) {
        this.handleElement(element);
    };
    DefaultHandler.prototype.writeDirective = function(element) {
        this.handleElement(element);
    };
    DefaultHandler.prototype.error = function(error) {
        this.handleCallback(error);
    };
    DefaultHandler.prototype._options = null;
    DefaultHandler.prototype._callback = null;
    DefaultHandler.prototype._done = false;
    DefaultHandler.prototype._tagStack = null;
    DefaultHandler.prototype.handleCallback = function(error) {
        if ("function" != typeof this._callback) {
            if (error) throw error;
            return;
        }
        this._callback(error, this.dom);
    };
    DefaultHandler.prototype.isEmptyTag = function(element) {
        var name = element.name.toLowerCase();
        "/" == name.charAt(0) && (name = name.substring(1));
        return this._options.enforceEmptyTags && !!DefaultHandler._emptyTags[name];
    };
    DefaultHandler.prototype.handleElement = function(element) {
        this._done && this.handleCallback(new Error("Writing to the handler after done() called is not allowed without a reset()"));
        if (!this._options.verbose) {
            delete element.raw;
            ("tag" == element.type || "script" == element.type || "style" == element.type) && delete element.data;
        }
        if (this._tagStack.last()) if (element.type != ElementType.Text && element.type != ElementType.Comment && element.type != ElementType.Directive) if ("/" == element.name.charAt(0)) {
            var baseName = element.name.substring(1);
            if (!this.isEmptyTag(element)) {
                var pos = this._tagStack.length - 1;
                while (pos > -1 && this._tagStack[pos--].name != baseName) ;
                if (pos > -1 || this._tagStack[0].name == baseName) while (this._tagStack.length - 1 > pos) this._tagStack.pop();
            }
        } else {
            this._tagStack.last().children || (this._tagStack.last().children = []);
            this._tagStack.last().children.push(element);
            this.isEmptyTag(element) || this._tagStack.push(element);
        } else {
            this._tagStack.last().children || (this._tagStack.last().children = []);
            this._tagStack.last().children.push(element);
        } else if (element.type != ElementType.Text && element.type != ElementType.Comment && element.type != ElementType.Directive) {
            if ("/" != element.name.charAt(0)) {
                this.dom.push(element);
                this.isEmptyTag(element) || this._tagStack.push(element);
            }
        } else this.dom.push(element);
    };
    var DomUtils = {
        testElement: function(options, element) {
            if (!element) return false;
            for (var key in options) if ("tag_name" == key) {
                if ("tag" != element.type && "script" != element.type && "style" != element.type) return false;
                if (!options["tag_name"](element.name)) return false;
            } else if ("tag_type" == key) {
                if (!options["tag_type"](element.type)) return false;
            } else if ("tag_contains" == key) {
                if ("text" != element.type && "comment" != element.type && "directive" != element.type) return false;
                if (!options["tag_contains"](element.data)) return false;
            } else if (!element.attribs || !options[key](element.attribs[key])) return false;
            return true;
        },
        getElements: function(options, currentElement, recurse, limit) {
            function getTest(checkVal) {
                return function(value) {
                    return value == checkVal;
                };
            }
            recurse = void 0 === recurse || null === recurse || !!recurse;
            limit = isNaN(parseInt(limit)) ? -1 : parseInt(limit);
            if (!currentElement) return [];
            var found = [];
            var elementList;
            for (var key in options) "function" != typeof options[key] && (options[key] = getTest(options[key]));
            DomUtils.testElement(options, currentElement) && found.push(currentElement);
            if (limit >= 0 && found.length >= limit) return found;
            if (recurse && currentElement.children) elementList = currentElement.children; else {
                if (!(currentElement instanceof Array)) return found;
                elementList = currentElement;
            }
            for (var i = 0; elementList.length > i; i++) {
                found = found.concat(DomUtils.getElements(options, elementList[i], recurse, limit));
                if (limit >= 0 && found.length >= limit) break;
            }
            return found;
        },
        getElementById: function(id, currentElement, recurse) {
            var result = DomUtils.getElements({
                id: id
            }, currentElement, recurse, 1);
            return result.length ? result[0] : null;
        },
        getElementsByTagName: function(name, currentElement, recurse, limit) {
            return DomUtils.getElements({
                tag_name: name
            }, currentElement, recurse, limit);
        },
        getElementsByTagType: function(type, currentElement, recurse, limit) {
            return DomUtils.getElements({
                tag_type: type
            }, currentElement, recurse, limit);
        }
    };
    exports.Parser = Parser;
    exports.DefaultHandler = DefaultHandler;
    exports.RssHandler = RssHandler;
    exports.ElementType = ElementType;
    exports.DomUtils = DomUtils;
})();

htmlparser = exports;