(function() {

    var audioContext = new (window.AudioContext || window.webkitAudioContext)();

    var points = [];

    var canvas = document.getElementById("theremin");
    var canvasContext = canvas.getContext("2d");
    
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    draw();

    function draw() {

        requestAnimationFrame(draw);

        canvasContext.clearRect(0, 0, canvas.width, canvas.height);

        for(var i = 0; i < points.length; i++) {
            points[i].draw();
        }
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function mouseStart(e) {

        e.preventDefault();

        var point = new Point(e, audioContext, canvas); //context and canvas for reference later
        points.push(point);
    }
    
    function touchStart(e) {

        e.preventDefault();

        for (var i = 0; i < e.changedTouches.length; i++) {
            var point = new Point(e.changedTouches[i], audioContext, canvas);
            points.push(point);
        }
    }

    function mouseMove(e) {

        e.preventDefault();

        var pos = getPos(undefined); //parameter only used for touch
        
        if(pos !== null) {
            points[pos].update(e);
        }
    }

    function touchMove(e) {

        e.preventDefault();

        for (var i = 0; i < e.changedTouches.length; i++) {

            var pos = getPos(e.changedTouches[i].identifier);
            
            if(pos !== null) {
                points[pos].update(e.changedTouches[i]);
            }
        }
    }

    function mouseEnd(e) {

        e.preventDefault();

        var pos = getPos(undefined); //parameter only used for touch
        
        if(pos !== null) {

            points[pos].stop();
            points.splice(pos, 1);
        }
    }

    function touchEnd(e) {

        e.preventDefault();

        for (var i = 0; i < e.changedTouches.length; i++) {

            var pos = getPos(e.changedTouches[i].identifier);
            
            if(pos !== null) {
            
                points[pos].stop();
                points.splice(pos, 1);
            }
        }
    }

    function getPos(id) {

        for (var i = 0; i < points.length; i++) {
        
            if (points[i].getIdentifier() == id) {
                return i;
            }
        }

        return null;
    }

    canvas.addEventListener('mousedown', mouseStart);
    canvas.addEventListener('touchstart', touchStart);
    canvas.addEventListener('mouseup', mouseEnd);
    canvas.addEventListener('mouseout', mouseEnd);
    canvas.addEventListener('touchend', touchEnd);
    canvas.addEventListener('touchcancel', touchEnd);
    canvas.addEventListener('mousemove', mouseMove);
    canvas.addEventListener('touchmove', touchMove);
})();