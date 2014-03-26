function Controller() {
    function closeWin() {
        Ti.API.log("closeWin");
        $.nextwin.close();
    }
    function getPageandParse() {
        Ti.API.log("getPageandParse");
        var select = soupselect.select;
        var body = '<html><head><title>Test</title></head><body><img src="http://l.yimg.com/mq/i/home/HKGallery.gif" /><div id="block">	<div class="row">Row 1</div>	<div class="row">Row 2</div></div></body></html>';
        var handler = new htmlparser.DefaultHandler(function(err, dom) {
            if (err) alert("Error: " + err); else {
                var rows = select(dom, "div.row");
                rows.forEach(function(row) {
                    Ti.API.info(row.children[0].data);
                });
            }
        });
        var parser = new htmlparser.Parser(handler);
        parser.parseComplete(body);
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "nextwin";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    var __defers = {};
    $.__views.nextwin = Ti.UI.createWindow({
        backgroundColor: "white",
        id: "nextwin"
    });
    $.__views.nextwin && $.addTopLevelView($.__views.nextwin);
    $.__views.__alloyId3 = Ti.UI.createButton({
        title: "Back",
        id: "__alloyId3"
    });
    closeWin ? $.__views.__alloyId3.addEventListener("click", closeWin) : __defers["$.__views.__alloyId3!click!closeWin"] = true;
    $.__views.nextwin.leftNavButton = $.__views.__alloyId3;
    $.__views.__alloyId4 = Ti.UI.createButton({
        title: "getPageandParse",
        id: "__alloyId4"
    });
    $.__views.nextwin.add($.__views.__alloyId4);
    getPageandParse ? $.__views.__alloyId4.addEventListener("click", getPageandParse) : __defers["$.__views.__alloyId4!click!getPageandParse"] = true;
    exports.destroy = function() {};
    _.extend($, $.__views);
    Ti.include("lib/htmlparser.js");
    Ti.include("lib/soupselect.js");
    __defers["$.__views.__alloyId3!click!closeWin"] && $.__views.__alloyId3.addEventListener("click", closeWin);
    __defers["$.__views.__alloyId4!click!getPageandParse"] && $.__views.__alloyId4.addEventListener("click", getPageandParse);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;