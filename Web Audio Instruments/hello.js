var oscillator = new Tone.Oscillator(220, "sine");
oscillator.toMaster();
var synth = new Tone.PolySynth(4, Tone.MonoSynth);
synth.toMaster();
//Why are underscores so popular?
synth._voices[1].type = "square";
synth._voices[2].type = "triangle";
synth._voices[3].type = "sawtooth";
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
	oscillator.setFrequency((input*220)+220);
}
//Tone Transport, matrix
function keyboardChange(input)
{
	var frequency = Math.pow(2,(input.note-69)/12) * 440;
	if(input.on!=0)
	{
		//console.log(input);
		synth.triggerAttack(frequency,1);
	}
	else synth.triggerRelease(frequency);
}
function envChange(input)
{
	//console.log(input);
	synth.envelope.attack = input.x;
	synth.envelope.decay = 1 - input.x;
	synth.envelope.sustain = input.x;
	synth.envelope.release = 1 - input.x;
}
function sliderChange(input)
{
	joints1.threshold = input.value * 100;
	joints1.init();
}
function jointsChange(input)
{
	if(input.node0)
	{
		synth._voices
	}
	if(input.node1)
	{
		
	}
	if(input.node2)
	{
		
	}
	if(input.node3)
	{
		
	}
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