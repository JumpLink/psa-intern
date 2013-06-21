exports.messages = function(req, res){
	messages = [
		{
			user: 'JumpLink',
			message: "Ich fahre heute in den Urlaub",
			time: '01.01.2012 13:00'
		},
		{
			user: 'Pfeil',
			message: "Ich möchte heute nicht gestört werden",
			time: '01.01.2012 13:00'
		}
	];
	res.json( messages );
	
};