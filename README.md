# talkman
A simple, lightweight and flexible communication API. Define your own mechanism to send/receive your messages and leave the rest to us
(to be continued...)



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
