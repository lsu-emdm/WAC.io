var oscillator = new Tone.Oscillator(220, "square");
oscillator.toMaster();
var types = ["sine", "square", "sawtooth", "triangle"];
var synths = new Array();
for(i=0; i<4; i++)
{
	synths[i] = new Tone.MonoSynth();
	synths[i].oscillator.type = types[i];
	//console.log(synths[i].oscillator.type);
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
	oscillator.setFrequency((input*220)+220);
}
//Tone Transport, matrix
function keyboardChange(input)
{
	var frequency = Math.pow(2,(input.note-69)/12) * 440;
	if(input.on!=0)
	{
		//console.log(input);
		synths[0].triggerAttack(frequency);
		synths[1].triggerAttack(frequency);
	}
	else
	{	
		//synths[0].triggerRelease();
		synths[1].triggerRelease();
	}
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