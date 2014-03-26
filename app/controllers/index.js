function nextWindow(e) {
    Ti.API.log("nextWindow");
    
    $.index.openWindow(Alloy.createController('nextwin').getView());	
}

$.index.open();
