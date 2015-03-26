
var Plotter = function() {
    var SCREEN_WIDTH = window.innerWidth,
        SCREEN_HEIGHT = window.innerHeight,

        VIEW_ANGLE = 45,
        ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
        NEAR = 0.1,
        FAR = 20000;
    this.camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
    this.camera.position.set(50,40,50);
    this.renderer = new THREE.WebGLRenderer({antialias:true});
    this.renderer.setClearColor(0xEEEEEE);
    this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    this.container = document.getElementById('ThreeJS');
    this.container.appendChild(this.renderer.domElement);
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.light1 = new THREE.DirectionalLight(0xffffff);
    this.light1.position.set(1, 1, 1);
    this.light2 = new THREE.DirectionalLight(0x002288);
    this.light2.position.set(-1, -1, -1);
    this.light3 = new THREE.AmbientLight(0x222222);
};

Plotter.prototype = {
    draw: function() {
        requestAnimationFrame(this.draw.bind(this));
        this.renderer.render(this.scene, this.camera);
    },

    init: function() {
        this.scene = new THREE.Scene();
        this.camera.lookAt(this.scene.position);
        this.scene.add(this.camera);
        this.scene.add(this.light1);
        this.scene.add(this.light2);
        this.scene.add(this.light3);
    },

    start: function(func, inputPlaneWidth, inputPlaneHeight, delta, planeDistance, rChecked, gChecked, bChecked) {
        var inputMinReal = - inputPlaneWidth / 2;
        var inputMaxReal = inputPlaneWidth / 2;
        var inputMinImg = - inputPlaneHeight / 2;
        var inputMaxImg = inputPlaneHeight / 2;

        // INPUT PLANE
        this.geometry = new THREE.PlaneBufferGeometry(inputPlaneWidth, inputPlaneHeight, 32);
        this.planeMaterial = new THREE.MeshBasicMaterial({color: 0xbbbbbb, side: THREE.DoubleSide, transparent: true, opacity: 0.5});
        var plane = new THREE.Mesh(this.geometry, this.planeMaterial); //plane.position.set(0, 0, 0);
        this.scene.add(plane);
        // axes
        this.drawAxis(inputMinReal, inputMaxReal, inputMinImg, inputMaxImg, 0);

        console.log('input plane has dimensions ' + inputPlaneWidth + '/' + inputPlaneHeight + '   minReal = ' + inputMinReal + ', maxReal: ' + inputMaxReal + ', minImg: ' + inputMinImg + ', maxImg: ' + inputMaxImg);  

        // DRAW LINES
        var resultMinReal = Number.MAX_VALUE;
        var resultMaxReal = - Number.MAX_VALUE;
        var resultMinImg = Number.MAX_VALUE;
        var resultMaxImg = - Number.MAX_VALUE;
        var minFact = Number.MAX_VALUE;
        var maxFact = - Number.MAX_VALUE;
        var avgFact = 0;

        this.lines = [];

        var count = 0;
        //do the calculations
        for(var r = inputMinReal; r <= inputMaxReal; r = r + delta){
            for(var i = inputMinImg; i <= inputMaxImg; i = i + delta){
                var inputC = new C(r, i);
                var resultC = func(inputC); //FUNCTION
                var resR = resultC.r;
                var resI = resultC.i;
                var fact = inputC.length / resultC.length;
                
                if(resultC.length > 0){
                    avgFact += fact;
                    count ++;
                    if(fact < minFact)
                        minFact = fact;
                    if(fact > maxFact)
                        maxFact = fact;
                }    
                //console.log(fact);
                //console.log(inputC + ' -> ' + resultC + ' fact: ' + roundVal(inputC.length, 1) + '/' + roundVal(resultC.length, 1) + '=' + roundVal(fact, 2));

                if(resR < resultMinReal)
                    resultMinReal = resR;
                if(resI < resultMinImg)
                    resultMinImg = resI;
                if(resR > resultMaxReal)
                    resultMaxReal = resR;
                if(resI > resultMaxImg)
                    resultMaxImg = resI;

                geometry = new THREE.Geometry();
                geometry.vertices.push(
                    new THREE.Vector3(inputC.r, inputC.i, 0),
                    new THREE.Vector3(resultC.r, resultC.i, planeDistance)
                );
                var line = new Plotter.Line(inputC, resultC, geometry);
                this.lines.push(line)
            }
        }
        console.log('minFact: ' + roundVal(minFact,2)); 
        console.log('maxFact: ' + roundVal(maxFact,2));
        avgFact /= count;
        console.log('avgFact: ' + roundVal(avgFact,2));

        //calculate color optimum //TODO improve...
        var valCloserToAvg;
        if(Math.abs(avgFact - minFact) < Math.abs(avgFact - maxFact))
             valCloserToAvg = minFact;
        else
            valCloserToAvg = maxFact;
        var diffToAvg = Math.abs(avgFact - valCloserToAvg);
        var colorRangeLowerBound = valCloserToAvg;
        var colorRangeUpperBound = avgFact + diffToAvg;
        var colorRangeSpanning = colorRangeUpperBound - colorRangeLowerBound;
        //console.log(colorRangeLowerBound); console.log(colorRangeUpperBound); console.log(colorRangeSpanning);

        //calculate colors and add lines and circles to the scene
        for(var i=0; i < this.lines.length; i++){
            //TODO
            //var northDistance = resultMaxImg - inputMaxImg;
            //this.lines[i].threeLineGeometry.vertices[1].z = calculatedPlaneDiff;

            var inputC = this.lines[i].inputC;
            var resultC = this.lines[i].resultC;  

            var fact = inputC.length / resultC.length;
            var col = 0;
            if(resultC.length > 0){
                if(fact > colorRangeLowerBound && fact < colorRangeUpperBound){
                    var relValInColorRange = fact - colorRangeLowerBound;
                    var colFact = relValInColorRange / colorRangeSpanning;
                    col = Math.round(colFact * 255);
                }
                if(fact < colorRangeLowerBound)
                    col = 0;
                if(fact > colorRangeUpperBound)
                    col = 255;
            }
   
            var colStr = 'rgb(' + (rChecked ? col : 0) + ',' + (gChecked ? col : 0) + ',' + (bChecked ? col : 0) + ')';
            lineMaterial = new THREE.LineBasicMaterial({color: colStr, linewidth: 1});
            var sphereMaterial = new THREE.MeshLambertMaterial({color: colStr});

            // spheres in input plane
            var sphereRadius = ((inputPlaneWidth * inputPlaneHeight) / Math.pow(inputPlaneWidth / delta, 2)) * 0.5;
            var sphereGeometry = new THREE.SphereGeometry(sphereRadius, 16, 16);
            var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.set(inputC.r, inputC.i, 0);
            this.scene.add(sphere);

            //spheres in target plane
            var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.set(resultC.r, resultC.i, planeDistance);
            this.scene.add(sphere);

            this.scene.add(new THREE.Line(this.lines[i].threeLineGeometry, lineMaterial));
        }

        // RESULT PLANE
        var resultPlaneWidth = resultMinReal * -1 + Math.abs(resultMaxReal);
        var resultPlaneHeight = resultMinImg * -1 + Math.abs(resultMaxImg);
        this.geometry = new THREE.PlaneBufferGeometry(resultPlaneWidth, resultPlaneHeight, 32);
        this.plane = new THREE.Mesh(this.geometry, this.planeMaterial);
        var middleDiffReal = resultMinReal + resultPlaneWidth / 2;
        var middleDiffImg = resultMinImg + resultPlaneHeight / 2;
        //console.log('resultMinReal: ' + resultMinReal); console.log('resultMaxReal: ' + resultMaxReal); console.log('resultMinImg: ' + resultMinImg); console.log('resultMaxImg: ' + resultMaxImg); 
        this.plane.position.set(middleDiffReal, middleDiffImg, planeDistance);
        this.scene.add(this.plane);
        this.drawAxis(resultMinReal, resultMaxReal, resultMinImg, resultMaxImg, planeDistance);

        console.log('result plane has dimensions ' + roundVal(resultPlaneWidth,1) + '/' + roundVal(resultPlaneHeight,1) + '   minReal = ' + roundVal(resultMinReal,2) + ', maxReal: ' + roundVal(resultMaxReal,2) + ', minImg: ' + roundVal(resultMinImg,2) + ', maxImg: ' + roundVal(resultMaxImg,2));  

        this.draw();
    }
};

Plotter.Line = function(inputC, resultC, threeLineGeometry){
    this.inputC = inputC;
    this.resultC = resultC;
    this.threeLineGeometry = threeLineGeometry;
};

Plotter.prototype.drawAxis = function(minX, maxX, minY, maxY, z){
    lineMaterial = new THREE.LineBasicMaterial({color: '#ffffff', linewidth: 1});
    geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3(minX, 0, z),
        new THREE.Vector3(maxX, 0, z)
    );
    this.scene.add(new THREE.Line(geometry, lineMaterial));
    geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3(0, minY, z),
        new THREE.Vector3(0, maxY, z)
    );
    this.scene.add(new THREE.Line(geometry, lineMaterial));
}
