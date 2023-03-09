# talkman
A simple framework to turn any event based (fire and forget) channel into asyncronous `request`/`response` based channel.
Examples - `Websockets`, `window.postMessage` etc

Users can use the pre-bundled transports and logic OR define their own custom transport.

### Current pre bundled transports 
 - `window.postMessage` 
   - API for browser/iframe communication etc
   - Users can do `request`/`response` type communication out of the box



### sample code
```js
import CommAPI, {TransportBrowserWindow} from 'talkman';

let source = window;         // iframe window
let target = window.parent   // parent of iframe window

const transport = new TransportBrowserWindow ({
  sourceWindow : source,
  targetWindow : target
});

const incomingInfo = (payload) => {

  console.log (payload);
  //further process "INFO" payload here
};

const incomingRequest = (payload) => {

  let res = {};
  
  try {
    // process "REQUEST" payload here
    res = {/* prepare "RESPONSE" here */};
    return res;  // resolves the awaiting request promise on the other end
  }
  catch (err) {
    throw err;  
    // rejects the awaiting request promise on the other end
  }
};

const messenger = new CommAPI ({
  transportInstance: transport,
  onReq: incomingRequest,
  onInfo: incomingInfo
});



const info = {/* INFO payload message */};
messenger.sendInfo (info);

const req = {/* REQUEST payload message */};
messenger.sendReq (req).then (
  (response) => {
    // REQUEST resolved with RESPONSE
  },
  (err) => {
    //REQUEST rejected with an error
  }
)

```


#### TODO
 - Add example of defining and using custom `Transport`
 - Explain `INFO` and `REQ`/`RES` paradigm for user understanding
