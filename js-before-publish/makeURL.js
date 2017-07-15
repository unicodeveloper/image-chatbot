export default (request) => { 
    const pubnub = require('pubnub');
    const db = require('kvstore');
    const xhr = require('xhr');

    console.log(request); // Log the request envelope passed 
    
    console.log('getting the context');
    
    return db.get('context').then((context) => {
        console.log("got existing context");
        if(!context) context = {};
    var command = request.message;
    console.log("analyzing action",command,context);
    var cloudName = "pubnub";
    var resource = "image";
    var operation = "upload";
    var transforms = [];

    //adjust the context
    if(command.action === 'reset') context = {};
    if(command.action === 'show') { }
    if(command.action === 'passthrough') { 
        return request.ok();
    }
    if(command.action === 'image') {
        context.path = command.path;
    }
    if(command.action === 'format') {
        context.format = command.format;
    }
    if(command.action === 'resize') {
        context.width = command.size;
    }
    if(command.action === 'compound') {
        command.actions.forEach((cmd)=>{
            if(cmd.action === 'autoContrast') context.autoContrast = true;
            if(cmd.action === 'autoSharpen') context.autoSharpen = true;
        });
    }
    //if(command.action === "pad") {
    //    transforms.push("w_200,h_300,c_fill,"+"g_"+command.gravity);
    //}
    if(command.action === 'crop') {
        context.crop = true;
        context.shape = 'square';
        context.gravity = command.gravity;
        //transforms.push("w_200,h_200,c_fill,g_"+command.gravity);
    }

    if(command.action === 'overlay') {
        console.log("doing an overlay");
        var fname = command.target;
        fname = "sample";
        var scale = 1.0;
        scale = 0.2;
        var grav = command.direction;
        transforms.push("l_"+fname+",w_"+scale+",g_"+grav);
    }


    //apply the context
    if(!context.path) context.path = 'sample.jpg';
    if(!context.format) context.format = 'jpg';
    if(context.width) {
        transforms.push("w_"+context.width);
    }
    if(context.autoContrast) transforms.push("e_auto_contrast");
    if(context.autoSharpen) transforms.push("e_sharpen");
    if(context.crop) {
        if(!context.width) context.width = 500;
        transforms.push("w_"+context.width+",h_"+context.width
            +",c_fill,g_"+context.gravity);
    }

    console.log("final context is",context);


    //generate the final url
    let apiUrl = 'http://res.cloudinary.com/' +
        cloudName + '/' + resource + '/' + operation + '/';
    if(transforms.length > 0) {
        apiUrl += transforms.join("/") + "/"
    }
    var filename = context.path.substring(0,context.path.lastIndexOf('.'));
    apiUrl += filename  + '.' + context.format;
    
    console.log("final url = ", apiUrl);
    request.message.cloudinaryURL = apiUrl;

    //save teh context
    db.set('context',context);
    return request.ok(); // Return a promise when you're done 
    
    });
}