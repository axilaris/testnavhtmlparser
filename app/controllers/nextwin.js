Ti.include('lib/htmlparser.js');
Ti.include('lib/soupselect.js');

function closeWin(e) {
    Ti.API.log("closeWin");
	$.nextwin.close();
}

function getPageandParse(e) {
    Ti.API.log("getPageandParse");
    	
	var select = soupselect.select;
	 
	var body = '<html><head><title>Test</title></head>'
			 + '<body>'
			 + '<img src="http://l.yimg.com/mq/i/home/HKGallery.gif" />'
			 + '<div id="block">'
			 + '	<div class="row">Row 1</div>'
			 + '	<div class="row">Row 2</div>'
			 + '</div>'
			 + '</body></html>';
	 
	var handler = new htmlparser.DefaultHandler(function(err, dom) {
		if (err) {
			alert('Error: ' + err);
		} else {
	 
			var rows = select(dom, 'div.row');
	 
			rows.forEach(function(row) {
				Ti.API.info(row.children[0].data);
			});
		}
	});
	 
	var parser = new htmlparser.Parser(handler);
	parser.parseComplete(body);    
    
    
}
