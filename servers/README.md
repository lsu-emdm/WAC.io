# Server tests

Server 1: (audience) web gui controls (performer's) max/msp

Server 2: (performer's) web gui controls (audience's) web audio

Server 3: performer sends different web audio instruments to audience phones

Server 4: each audience member is one column of a sequencer

## Rhizome

This has been my first exploration of the [Rhizome](https://github.com/sebpiq/rhizome) server toolkit. These demos also use [NexusUI](http://nexusosc.com)

I was able to create most of our server situations in about 6 hours of work, which is really not bad. It wraps socket.io and express, which we talked about using.

To try these examples, you'll need to install rhizome: 

`npm install -g rhizome-server` 

If this worked, you can type `rhizome` and it should print something other than an error. Then you can go into any of the server folders on this page and type `rhizome config.js`


**Notable features**

- It automatically logs events in a local .db database file and can recall the state of the performance if the server crashes or a user disconnects.

- Pages can subscribe/unsubscribe to different OSC messages, so it was pretty easy to have an audience page listen for certain events while performers listen for different events.

- It appears to automatically queue users if the server gets stressed, to prevent crashes.

- Can send files around as 'blobs'. There's an example for sending images. Sending audio would be great...

- A config.js file lets you change server settings without going into the other code.


**Possible downsides**

- Each IP is given its own user ID, but not each browser or socket connection. So, if you open up multiple browsers on the same machine, it's hard to tell them apart on the server side because they all have the same ID.

- It uses a custom `rhizome` keyword in node. You start a server by writing `rhizome config.js`. I will need to try it with npm to see if it can be included/required into our own project.





