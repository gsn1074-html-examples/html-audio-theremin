function Point(point, audioContext, canvas) {

    var x = Math.min(Math.max(point.clientX, 0), canvas.width);
    var y = Math.min(Math.max(point.clientY, 0), canvas.height);

    var identifier = point.identifier;
    var canvasContext = canvas.getContext("2d");
    var color = `hsl(${Math.round(Math.random() * 255)}, 100%, 50%)`;

    //create oscillator node
    var oscillator = audioContext.createOscillator();
    oscillator.frequency.setTargetAtTime(_calculateFrequency(), audioContext.currentTime, 0.01); //ease in to change

    //create gain node
    var gainNode = audioContext.createGain();
    gainNode.gain.setTargetAtTime(_calculateGain(), audioContext.currentTime, 0.01); //ease in to change

    //create analyser node
    var audioAnalyser = audioContext.createAnalyser();
    var bufferLength = audioAnalyser.fftSize;

    //chain nodes together
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    gainNode.connect(audioAnalyser);

    //start playing
    oscillator.start(audioContext.currentTime);

    function getIdentifier() {
        return identifier;
    }

    //update the tone based on point data
    function update(point) {

        x = Math.min(Math.max(point.clientX, 0), canvas.width);
        y = Math.min(Math.max(point.clientY, 0), canvas.height);

        oscillator.frequency.setTargetAtTime(_calculateFrequency(), audioContext.currentTime, 0.01); //ease in to change
        gainNode.gain.setTargetAtTime(_calculateGain(), audioContext.currentTime, 0.01); //ease in to change
    }

    //stop playing - disconnect oscillator to free up nodes for garbage collection
    function stop() {

        oscillator.stop(audioContext.currentTime);
        oscillator.disconnect();
    }

    //draw the waveform on the canvas
    function draw() {

        var dataArray = new Uint8Array(bufferLength);
        audioAnalyser.getByteTimeDomainData(dataArray);

        canvasContext.lineWidth = 3;
        canvasContext.strokeStyle = color;

        canvasContext.beginPath();

        //determine the width of each segment
        var sliceWidth = canvas.width / bufferLength;
        
        //draw the line
        var x = 0;

        for (var i = 0; i < bufferLength; i++) {

            var amplitude = dataArray[i] / 128;
            var y = amplitude * canvas.height / 2;

            if (i === 0) {
            
                canvasContext.moveTo(x, y);
            
            } else {
            
                canvasContext.lineTo(x, y);
            
            }

            x += sliceWidth;
        }

        //add glow to line
        canvasContext.shadowColor = color;
        canvasContext.shadowOffsetX = 0;
        canvasContext.shadowOffsetY = 0;
        canvasContext.shadowBlur = 10;

        //render the line
        canvasContext.stroke();
    };

    //calculate the frequency based on the window width
    function _calculateFrequency() {
       
        var minFrequency = 20;
        var maxFrequency = 2000;

        return ((x / canvas.width) * maxFrequency) + minFrequency;
    };

    //calculate the volume based on the window height
    function _calculateGain() {
        
        var minGain = 0;
        var maxGain = 1;

        return 1 - ((y / canvas.height) * maxGain) + minGain;
    };

    return {
        getIdentifier: getIdentifier,
        update: update,
        stop: stop,
        draw: draw
    }
}