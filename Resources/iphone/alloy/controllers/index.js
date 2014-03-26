function Controller() {
    function nextWindow() {
        Ti.API.log("nextWindow");
        $.index.openWindow(Alloy.createController("nextwin").getView());
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "index";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    var __defers = {};
    $.__views.__alloyId0 = Ti.UI.createWindow({
        backgroundColor: "white",
        title: "Nav HTML Parser app",
        id: "__alloyId0"
    });
    $.__views.__alloyId1 = Ti.UI.createButton({
        title: "nextWindow",
        id: "__alloyId1"
    });
    $.__views.__alloyId0.add($.__views.__alloyId1);
    nextWindow ? $.__views.__alloyId1.addEventListener("click", nextWindow) : __defers["$.__views.__alloyId1!click!nextWindow"] = true;
    $.__views.index = Ti.UI.iOS.createNavigationWindow({
        window: $.__views.__alloyId0,
        id: "index"
    });
    $.__views.index && $.addTopLevelView($.__views.index);
    exports.destroy = function() {};
    _.extend($, $.__views);
    $.index.open();
    __defers["$.__views.__alloyId1!click!nextWindow"] && $.__views.__alloyId1.addEventListener("click", nextWindow);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;