function makeValueChecker(operator, value) {
    value = "string" == typeof value ? value : "";
    return operator ? {
        "=": function(test_value) {
            return test_value === value;
        },
        "~": function(test_value) {
            return test_value ? -1 !== test_value.split(/\s+/).indexOf(value) : false;
        },
        "^": function(test_value) {
            return test_value ? test_value.substr(0, value.length) === value : false;
        },
        $: function(test_value) {
            return test_value ? test_value.substr(-value.length) === value : false;
        },
        "*": function(test_value) {
            return test_value ? -1 !== test_value.indexOf(value) : false;
        },
        "|": function(test_value) {
            return test_value ? test_value === value || test_value.substr(0, value.length + 1) === value + "-" : false;
        }
    }[operator] : function(test_value) {
        return test_value ? true : false;
    };
}

exports = {};

var domUtils = htmlparser.DomUtils;

var tagRe = /^[a-z0-9]+$/;

var attrSelectRe = /^(\w+)?\[(\w+)([=~\|\^\$\*]?)=?"?([^\]"]*)"?\]$/;

exports.select = function(dom, selector) {
    var currentContext = [ dom ];
    var found, tag, options;
    var tokens = selector.split(/\s+/);
    for (var i = 0; tokens.length > i; i++) {
        var match = attrSelectRe.exec(tokens[i]);
        if (match) {
            var attribute = match[2], operator = match[3], value = match[4];
            tag = match[1];
            options = {};
            options[attribute] = makeValueChecker(operator, value);
            found = [];
            for (var j = 0; currentContext.length > j; j++) found = found.concat(domUtils.getElements(options, currentContext[j]));
            tag && (found = domUtils.getElements({
                tag_name: tag
            }, found, false));
            currentContext = found;
        } else if (-1 !== tokens[i].indexOf("#")) {
            found = [];
            var id_selector = tokens[i].split("#", 2)[1];
            var el = null;
            for (var k = 0; currentContext.length > k; k++) {
                el = "undefined" != typeof currentContext[k].children ? domUtils.getElementById(id_selector, currentContext[k].children) : domUtils.getElementById(id_selector, currentContext[k]);
                if (el) {
                    found.push(el);
                    break;
                }
            }
            if (!found[0]) {
                currentContext = [];
                break;
            }
            currentContext = found;
        } else if (-1 !== tokens[i].indexOf(".")) {
            var parts = tokens[i].split(".");
            tag = parts[0];
            options = {};
            options["class"] = function(value) {
                if (!value) return false;
                var classes = value.split(/\s+/);
                for (var i = 1, len = parts.length; len > i; i++) if (!~classes.indexOf(parts[i])) return false;
                return true;
            };
            found = [];
            for (var l = 0; currentContext.length > l; l++) {
                var context = currentContext[l];
                if (tag.length > 0) {
                    context = domUtils.getElementsByTagName(tag, context);
                    found = found.concat(domUtils.getElements(options, context, false));
                } else found = found.concat(domUtils.getElements(options, context));
            }
            currentContext = found;
        } else if ("*" === tokens[i]) ; else {
            if (!tagRe.test(tokens[i])) {
                currentContext = [];
                break;
            }
            found = [];
            for (var m = 0; currentContext.length > m; m++) "undefined" != typeof currentContext[m].children ? found = found.concat(domUtils.getElementsByTagName(tokens[i], currentContext[m].children)) : 0 === i && (found = found.concat(domUtils.getElementsByTagName(tokens[i], currentContext[m])));
            currentContext = found;
        }
    }
    return currentContext;
};

soupselect = exports;