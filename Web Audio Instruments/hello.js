var oscillator = new Tone.Oscillator(220, "square");
oscillator.toMaster();
oscillator.volume.value = -25;
var types = ["sine", "square", "sawtooth", "triangle"];
var synths = new Array();
console.log(oscillator);
for(i=0; i<4; i++)
{
	synths[i] = new Tone.MonoSynth();
	synths[i].oscillator.type = types[i];
	console.log(synths[i].oscillator.type);
	synths[i].toMaster();
}
function toggleChange(input)
{
	switch(input)
	{
		case 1: oscillator.start(); break;
		case 0: oscillator.stop(); break;
	}
}
function dialChange(input)
{
	oscillator.frequency.value = ((input*220)+220);
}
//Tone Transport, matrix
function keyboardChange(input)
{
	var frequency = Math.pow(2,(input.note-69)/12) * 440;
	if(input.on!=0)
	{
		synths[0].triggerAttackRelease(frequency);
		synths[1].triggerAttackRelease(frequency);
		synths[2].triggerAttackRelease(frequency);
		synths[3].triggerAttackRelease(frequency);
	}
	else
	{	
		synths[0].triggerRelease();
		synths[1].triggerRelease();
		synths[2].triggerRelease();
		synths[3].triggerRelease();
	}
}
function envChange(input)
{
	//console.log(input);
	for(var i=0; i<4; i++)
	{
	synths[i].envelope.attack = input.x;
	synths[i].envelope.decay = 1 - input.x;
	synths[i].envelope.sustain = input.x;
	synths[i].envelope.release = 1 - input.x;
	}
}
function sliderChange(input)
{
	joints1.threshold = input.value * 100;
	joints1.init();
}
//possibly a better way to get this number. I just guessed.
var scale = 27;
function jointsChange(input)
{
	//really need a (0,1)->db thing
	console.log(input);
	if(input.node0)
		synths[0].volume.value = (input.node0-1)*scale;
	else synths[0].volume.value = -100;
	if(input.node1)
		synths[1].volume.value = (input.node1-1)*scale;
	else synths[1].volume.value = -100;
	if(input.node2)
		synths[2].volume.value = (input.node2-1)*scale;
	else synths[2].volume.value = -100;
	if(input.node3)
		synths[3].volume.value = (input.node3-1)*scale;
	else synths[3].volume.value = -100;
}
nx.onload = function()
{
	//console.log("loaded");
	toggle1.on('value', function(data){toggleChange(data);});
	dial1.on('value', function(data){dialChange(data);});
	//keyboard1.octaves = 8;
	//change offset, make it bigger
	//keyboard1.init();
	keyboard1.on('*', function(data){keyboardChange(data);});
	envelope1.on('*', function(data){envChange(data);});
	joints1.joints = [
	{ x: 25, y:25 },
		{ x:75, y:25},
			{ x:25, y:75},
				{ x:75, y:75}
	]
	slider1.on('*', function(data){sliderChange(data);});
	joints1.init();
	joints1.on('*', function(data){jointsChange(data);});
}