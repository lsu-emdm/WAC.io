# WAC.io 

Matthew Wolff - Campus Future Leaders in Research

______
## Project Outline

__WAC.io— (working title)__

We shall create a server - focusing on raspberry pi (or Android) but also hostable on Linux/PC/Mac -that hosts web pages via node.js (or more probably io.js) and handles communications to and from devices that load a web page.  

We will make a native app in Android and iOS that will host web pages embedded with Web Audio.  These instruments may be performable directly on the device, or send/receive messages to the server or through the server to other people on the network.

The pi device will host a BLE node which the app communicates with to automatically detect when an instrument is available and offer to load it when within range. (We have prototyped this on RPi, iOS and Android already)

We will create instruments & demo applications using this server solution that:

- demonstrate hosting Web Audio Instruments that are directly tied to place (perhaps an instrument that allows you to play a carillon, organ, or video wall)
- Distributing instruments to an ensemble (this will tie in with some other research at the CCT - Orchestra of Things)
- Distributing instruments and controlling them from a central performer - e.g. everyone becomes a speaker
- A networked sequencing instrument that passes performance commands down the chain of logged in users. (I’m thinking an audio performance version of the snake game)
- The holy grail, a distributed performance where everyones interactions affect each other in near real-time. 

We shall create test suites and optimize all of the communications enabled above.

In the end we will have a solution for distributed or live Web Audio performances that can be quickly developed and deployed inexpensively and reliably.


____
## First Steps

To Learn::

Immediate:

- Web Audio API - Where it all starts.  These are web audio node js objects which can be chained together to create an audio graph for processing.
- Tone.js - This library we will focus on for now - it is flexible and works very well on laptops and mobile devices. It is a higher level library which can be used to implement more musical ideas.  The latest paper is on the timing/sequencing aspects that have been developed.
- NexusUI.js - http://nexusosc.com - The set of UI objects that we’ve developed.  We may need to develop more for some of the ideas that we’re cooking up.  

Intermediate:

- io.js (previously node.js - complicated situation)  This combined with socket.io, express, and node-osc will be the core of the application.  
- Gibber - This environment and it’s gibber.lib library we have been using for prior instruments and Live coding.  I would like you to look at it and play with it a little bit to see a different approach to coding audio in browser.  It has collaborative coding, code completion and execution in browser, as well as a reduced syntax for musical parameters like pitch sequences and rhythm.
- Mayda - audio analysis nodes.  This is an incredibly nascent field.  It may be possible for us to do things like beat detection and tempo mapping, pitch correction, score following, and many wilder ideas within a browser.  

Exmediate:

- Android 
	- BLE
	- Wifi switch to local network
- iOS 
	- BLE
	- Wifi change to local network


Ben

- 










