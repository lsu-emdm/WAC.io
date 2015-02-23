var oscillator = new Tone.Oscillator(220, "square");
oscillator.toMaster();
//var omni = new Tone.OmniOscillator(220,"sawtooth");
var synth = new Tone.MonoSynth();
synth.toMaster();
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
function keyboardChange(input)
{
	if(input.on!=0)
	{
		console.log(input);
		//need to translate note to frequency
		//There has to be an easier way...
		//wikipedia.org/MIDI Tuning System
		var frequency = Math.pow(2,(input.note-69)/12) * 440;
		//Higher notes decay slower...
		console.log(frequency);
		synth.triggerAttackRelease(frequency);
	}
}
nx.onload = function()
{
	toggle1.on('value', function(data){toggleChange(data);});
	dial1.on('value', function(data){dialChange(data);});
	keyboard1.octaves = 8;
	keyboard1.on('*', function(data){keyboardChange(data);});
}