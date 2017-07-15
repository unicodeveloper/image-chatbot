/**
 * Created by josh on 1/4/17.
 */

var assert = require('assert');

var ParserService = require('../src/ParserService');

function test(text, expected) {
    var result = ParserService.parse(text);
    console.log(result);
    assert.deepEqual(expected,result);
}

/*
Please upload library fall-collection-pics
Please display images in WebP format
Please resize to 1024 wide
Please auto-contrast and auto-sharpen.
please set gravity to auto and pad crop mode with black and crop
Please overlay ACME-30x60-logo at south_west corner


next step: turn an action into a URL

 let apiUrl = 'http://res.cloudinary.com/' +
 cloudName + '/' + resource + '/' + operation + '/';
 if(transformations && transformations.length > 0) {
 apiUrl += transformations.join(',') + '/';
 }
 apiUrl += fileName;

 request.message.cloudinaryLink = apiUrl;
 console.log("request = ", request);

 */

function testParser() {

//should not return any action
    test("please show the image",{ action:"show"});
    test("hello, how are you doing",false);
    //test("Please upload library fall-collection-pics",{
    //    action:'upload',
    //    target:'fall-collection-pics',
    //});
    test("Since we are all using chrome, please display the image in webp format", { action:'format', format:'webp' });
    test("Please display images in WebP format", { action:"format", format:"webp" });
    test("Please display the image jpg format", { action:"format", format:"jpg" });
    test("Please resize to 1024 wide", { action:'resize', size:1024,  axis:'width' });
    test("please set the width to 500", {action:"resize",axis:'width', size:500});
    test("Please auto-contrast and auto-sharpen", { action:"compound",  actions:[  { action:'autoContrast' }, { action:"autoSharpen" } ] });
    test("that doesn't look right. please auto-contrast and auto-sharpen", { action:"compound",  actions:[  { action:'autoContrast' }, { action:"autoSharpen" } ] });
    test("Hmm. It should be centered. Please make it square and center the dress", {  action:"crop", gravity:'auto', shape:'square' });
    test("please make it square", {  action:"crop", gravity:'auto', shape:'square' });
    test("Please overlay acme-logo at south_west corner",{ action:'overlay', target:'acme-logo', direction:'south_west' });
    test("please overlay the acme_logo in the south-west corner", {  action:'overlay', target:'acme_logo',direction:'south_west' });
    test("please overlay foo in the north east corner", {  action:'overlay', target:'foo',direction:'north_east' });
    test("please overlay foo to the north", {  action:'overlay', target:'foo',direction:'north' });
    test("please reset the image", { action:'reset'});
    test("please use image foobar/baz.jpg", { action:'image',path:'foobar/baz.jpg'});
}

var ctx = {path:"sample.jpg"}
function testAction(action, expected) {
    var result = ParserService.actionToURL(action,ctx);
    console.log(result);
    assert.deepEqual(expected,result);
}


function testActions() {
    testAction({action:'show'},
        "http://res.cloudinary.com/pubnub/image/upload/sample.jpg");
    testAction({action:'format',format:'webp'},
        "http://res.cloudinary.com/pubnub/image/upload/sample.webp");
    testAction({action:'format',format:'jpg'},
        "http://res.cloudinary.com/pubnub/image/upload/sample.jpg");
    testAction({action:'resize',size:150, axis:'width'},
        "http://res.cloudinary.com/pubnub/image/upload/w_150/sample.jpg");
    testAction({action:"compound", actions:[{action:'autoContrast'},{action:'autoSharpen'}]},
        "http://res.cloudinary.com/pubnub/image/upload/w_150/e_auto_contrast/e_sharpen/sample.jpg");
    ctx = {path:"sample.jpg",width:200};
    testAction({action:'crop', gravity:'auto', shape:'square'},
        "http://res.cloudinary.com/pubnub/image/upload/w_200/w_200,h_200,c_fill,g_auto/sample.jpg");


    ctx = {path:"sample.jpg",width:200};
    testAction({ action:'overlay', target:'acme-logo', direction:'south_west' },
        "http://res.cloudinary.com/pubnub/image/upload/l_sample,w_0.2,g_south_west/w_200/sample.jpg");
    testAction({ action:'overlay', target:'acme-logo', direction:'north_west' },
        "http://res.cloudinary.com/pubnub/image/upload/l_sample,w_0.2,g_north_west/w_200/sample.jpg");
}



testParser();
testActions();