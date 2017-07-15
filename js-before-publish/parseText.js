export default (request) => { 
    const pubnub = require('pubnub');
    const kvstore = require('kvstore');
    const xhr = require('xhr');
    const query = require('codec/query_string');

    var url = "http://joshondesign.com:34228/?" + query.stringify({
        text:request.message.text
    });
    console.log("sending url",url);

    return xhr.fetch(url).then((res) => {
        var ans = JSON.parse(res.body);
        console.log("got back",ans);
        if(ans.action === 'error') {
            request.message = ans;
            return request.ok();
        }
        request.message = ans;
        pubnub.publish({ channel:'make-url', message:ans});
        return request.ok();
    })
}