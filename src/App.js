/*

next steps

the script

good morning
upload image
please show the image
please set the width to 500
Since we are all using chrome, please display the image in webp format
that doesn't look right. please auto-contrast and auto-sharpen
it should be centered. please make it square and center the dress
please overlay acmelogo at the south-west corner



TODOS:

 //button to upload an image. use filename as the image name.
 //figure out the pad crop with auto action. it should center the image on the point of interest
 //make it remember the previously set commands
 //move the parser service into a block

//improve error handling for parser service. never crash. send JSON errors only. including error //status code that is shown to the user
//support 'please reset the image'
support 'north west' and other directions
//support passthrough to not include the cloudinary url
//pull a copy of the block code into the repo


find a demo image that works. like the dress
upload an acme logo at a small size, so we don't have to specify the scale

 */
import React, { Component } from 'react';
import './App.css';
import ImageService from "./ImageService";
import ParserService from './ParserService';
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            messages:[],
            currentText:""
        };

        ImageService.init();
        ImageService.onMessage((msg, messages) => {
            this.setState({
                messages:messages
            });
            this.scrollDown();
        });
        this.ctx = {};
    }
    textEdit() {
        this.setState({currentText:this.refs.text.value});
    }
    textKeydown(e) {
        if(e.keyCode === 13) {
            this.sendMessage();
        }
    }
    sendMessage() {
        ImageService.send(this.state.currentText);
        this.setState({currentText:""});
    }
    scrollDown() {
        function move(delay) {
            setTimeout(()=>{
                var elm = document.getElementById('scroll');
                elm.scrollTop = elm.scrollHeight;
            },delay);
        }
        move(100);
        move(500);
        move(1000);
        move(1500);
        move(2000);
    }

    renderHistory() {
        var items = this.state.messages.map((msg,i)=>{
            if(msg.action && msg.action === 'error') {
                return <li key={i} className="error">
                    <p>"{msg.originalText}"</p>
                    <p>{msg.message}</p>
                </li>;
            }
            return <li key={i}>
                <p>{msg.originalText}</p>
                {msg.cloudinaryURL?<img key="img" src={msg.cloudinaryURL}/>:""}
            </li>
        });
        return <ul>{items}</ul>;
    }
    render() {
        return (
            <div className="vbox fill">
                <div className="scroll grow" id="scroll">
                    {this.renderHistory()}
                </div>
                <div className="hbox">
                    <input ref='text' type="text" className="grow"
                           value={this.state.currentText} onChange={this.textEdit.bind(this)}
                           onKeyDown={this.textKeydown.bind(this)}
                    />
                    <button onClick={this.sendMessage.bind(this)}>send</button>
                    <button onClick={this.showUploader.bind(this)}>Upload Image</button>
                </div>
            </div>
        );
    }

    showUploader() {
        var cloudinary = window.cloudinary;
        cloudinary.openUploadWidget({ cloud_name: 'pubnub', upload_preset: 'mcipauzl'},
            (error, result) => {
                console.log(error, result);
                console.log("the upload path is", result[0].path);
                ImageService.setImagePath(result[0].path);
            });
    }
}

export default App;
