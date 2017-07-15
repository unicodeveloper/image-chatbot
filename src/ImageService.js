import PubNub from "pubnub";

var service = {
    init: function() {
        this.cbs = [];
        this.history = [];
        this.pubnub = new PubNub({
            publishKey: "pub-c-8de1bd61-c0a0-46a6-a3fa-0e9a3fb156b8",
            subscribeKey: "sub-c-44db874c-d29c-11e6-b82b-0619f8945a4f"
        });
        var self = this;
        this.pubnub.addListener({
            message: function(message) {
                console.log("got message",message);
                if(message.channel == "parse-text") {
                    if(message.message.action !== 'error') return;
                }
                self.history.push(message.message);
                self.fireMessage(message.message);
            }
        });
        this.pubnub.subscribe({channels:['make-url','parse-text']});
        this.imagePath = "sample.jpg";
    },
    setImagePath: function(path) {
        this.imagePath = path;
        this.pubnub.publish({
            channel:["parse-text"],
            message: {text:"please reset the image"}
        });
        setTimeout(() => {
            this.pubnub.publish({
                channel:["parse-text"],
                message: { text: "please use image " + path}
            })
        },1000);
    },
    getImagePath: function() {
        return this.imagePath;
    },
    onMessage:function(cb) {
        this.cbs.push(cb);
    },
    fireMessage: function(msg) {
        this.cbs.forEach((cb)=> {
            cb(msg,this.history);
        });
    },
    send: function(text) {
        this.pubnub.publish({
            channel:["parse-text"],
            message: { text: text}
        });
    }
};

module.exports = service;