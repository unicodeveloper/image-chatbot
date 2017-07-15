function upload(words,n) {
    return {
        action:'upload',
        target:words[n+3]
    }
}
function display(words) {
    var format = words.find((w)=>{
        if(w === 'webp') return true;
        if(w === 'jpeg') return true;
        if(w === 'jpg') return true;
        return false;
    });
    return {
        action:'format',
        format:format
    }
}
function show(words) {
    return {
        action:'show'
    }
}
function resize(words) {
    var numberIndex = words.findIndex((w) => {
        var num = parseInt(w);
        if(!isNaN(num)) return true;
        return false;
    });
    var axis = words[numberIndex+1];
    if(axis === 'wide') {
        axis = 'width';
    }
    return {
        action:'resize',
        size:parseInt(words[numberIndex]),
        axis: axis
    }
}
function reset(words) {
    return {
        action:'reset'
    }
}
function useImage(words) {
    var nextWord = words.shift();
    var path = nextWord;
    if(nextWord === 'image') path = words.shift();
    return {
        action:"image",
        path:path
    }

}
function setWidth(rest) {
    return {
        action: 'resize',
        size:parseInt(rest[1]),
        axis:'width'
    }
}
function makeSquare(words) {
    if(words[1] && words[1] === 'and' && words[2] === 'center') {
        console.log("centering too");
        return {
            action: "crop",
            gravity:'auto',
            shape:'square'
        }
    }
    return {
        action:'crop',
        gravity:'auto',
        shape:'square'
    }
}

function isCompassDirection(dir) {
    if(dir === 'south') return true;
    if(dir === 'north') return true;
    if(dir === 'east') return true;
    if(dir === 'west') return true;
    return false;
}

function overlay(words) {
    console.log("scanning words",words);
    var imageName = words.shift();
    //remove all - and _ and split on spaces, then back to a flat array
    var dirwords = words
        .map((w)=> w.replace("_"," ").replace("-"," "))
        .map((w)=> w.split(" "))
        .reduce((a,b)=>a.concat(b));

    var d1 = dirwords.shift();
    if(isCompassDirection(d1)) {
        var d2 = dirwords.shift();
        if(isCompassDirection(d2)) {
            return {
                action:'overlay',
                target: imageName,
                direction: `${d1}_${d2}`
            }
        } else {
            return {
                action:'overlay',
                target: imageName,
                direction: d1
            }
        }
    } else {
        return false;
    }
}


var service = {
    parse: function(text) {
        console.log("parsing:",text);

        var words = text.split(" ")
            .map((w)=>w.toLowerCase())
            .filter((w)=>{
                if(w === 'the')return false;
                if(w === 'it') return false;
                if(w === 'to') return false;
                if(w === 'at') return false;
                if(w === 'in') return false;
                return true;
            });
        console.log("words",words);
        if(!words.includes("please")) return false;

        var n = words.findIndex((w) => w === 'please');
        var verb = words[n+1];
        var nextWord = words[n+2];
        var rest = words.slice(n+2);
        console.log("verb=", verb, "next=",nextWord, "rest=",rest);

        if(verb === 'upload') return upload(words,n);
        if(verb === 'display') return display(rest);
        if(verb === 'show') return show(rest);
        if(verb === 'resize') return resize(rest);
        if(verb === 'reset') return reset(rest);
        if(verb === 'make' && nextWord === 'square') return makeSquare(rest);

        if(nextWord && nextWord === 'and') {
            return {
                action:'compound',
                actions:[
                    {action:'autoContrast'},
                    {action:'autoSharpen'}
                ]
            }
        }
        if(verb === 'set' && nextWord === 'width') return setWidth(rest);

        if(verb === 'set' && nextWord === 'gravity') {
            return {
                action: 'compound',
                actions:[
                    {
                        action:'setGravity',
                        value:'auto'
                    },
                    {
                        action:"pad",
                        values:['black','crop']
                    }
                ]
            }
        }

        if(verb === 'overlay') return overlay(rest);

        if(verb === 'use') return useImage(rest);

        return {
            action:'error',
            message:'command not recognized'
        };
    },
    actionToURL:function(command, context) {
        console.log("analyzing action",command,context);
        var cloudName = "pubnub";
        var resource = "image";
        var operation = "upload";
        var transforms = [];

        //adjust the context
        if(command.action === 'show') {
        }
        if(command.action === 'format') {
            context.format = command.format;
        }
        if(command.action === 'reset') {
            context = {};
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
            if(command.direction === 'southwest') {
                grav = 'south_west';
            }
            transforms.push("l_"+fname+",w_"+scale+",g_"+grav);
        }


        //apply the context
        if(!context.format) context.format = 'jpg';
        if(context.width) {
            transforms.push("w_"+context.width);
        }
        if(context.autoContrast) transforms.push("e_auto_contrast");
        if(context.autoSharpen) transforms.push("e_sharpen");
        if(context.crop) {
            transforms.push("w_"+context.width+",h_"+context.width
                +",c_fill,g_"+context.gravity);
        }

        console.log("final context is",context);


        //generate the final url
        var apiUrl = 'http://res.cloudinary.com/' +
            cloudName + '/' + resource + '/' + operation + '/';
        if(transforms.length > 0) {
            apiUrl += transforms.join("/") + "/"
        }
        var filename = context.path.substring(0,context.path.lastIndexOf('.'));
        apiUrl += filename  + '.' + context.format;
        return apiUrl;
    }
};

module.exports = service;