
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

    this.planeMaterial = new THREE.MeshBasicMaterial({color: 0xbbbbbb, side: THREE.DoubleSide, transparent: true, opacity: 0.5});
};

Plotter.prototype = {
    draw: function() {
        requestAnimationFrame(this.draw.bind(this));
        this.renderer.render(this.scene, this.camera);
    },

    init: function(inputPlaneWidth, inputPlaneHeight, delta, showPlanes) {
        this.scene = new THREE.Scene();
        this.camera.lookAt(this.scene.position);
        this.scene.add(this.camera);
        this.scene.add(this.light1);
        this.scene.add(this.light2);
        this.scene.add(this.light3);

        var inputMinReal = - inputPlaneWidth / 2;
        var inputMaxReal = inputPlaneWidth / 2;
        var inputMinImg = - inputPlaneHeight / 2;
        var inputMaxImg = inputPlaneHeight / 2;

        this.pointsHistory = [];
        this.latestPlaneZpos = 0;
        var pointsInOnePlane = [];

        for(var r = inputMinReal; r <= inputMaxReal; r = r + delta)
            for(var i = inputMinImg; i <= inputMaxImg; i = i + delta)
                pointsInOnePlane.push(new C(r, i));

        this.pointsHistory.push(pointsInOnePlane);
        if(showPlanes)
            this.drawPlane(pointsInOnePlane, this.latestPlaneZpos);
    },

    drawPlane: function(pointsInOnePlane, zPos){
        var minReal = Number.MAX_VALUE;
        var maxReal = - Number.MAX_VALUE;
        var minImg = Number.MAX_VALUE;
        var maxImg = - Number.MAX_VALUE;
        for(var i=0; i < pointsInOnePlane.length; i++){
            var real = pointsInOnePlane[i].r;
            var img = pointsInOnePlane[i].i;
            if(real < minReal)
                minReal = real;
            if(img < minImg)
                minImg = img;
            if(real > maxReal)
                maxReal = real;
            if(img > maxImg)
                maxImg = img;
        }
        var planeWidth = minReal * -1 + Math.abs(maxReal);
        var planeHeight = minImg * -1 + Math.abs(maxImg);
        var geometry = new THREE.PlaneBufferGeometry(planeWidth, planeHeight, 32);
        var plane = new THREE.Mesh(geometry, this.planeMaterial);
        var middleDiffReal = minReal + planeWidth / 2;
        var middleDiffImg = minImg + planeHeight / 2;
        plane.position.set(middleDiffReal, middleDiffImg, zPos);
        plane.name = 'plane';
        this.scene.add(plane);
        console.log('plane has dimensions ' + roundVal(planeWidth,1) + '/' + roundVal(planeHeight,1) + '   minReal = ' + roundVal(minReal,2) + ', maxReal: ' + roundVal(maxReal,2) + ', minImg: ' + roundVal(minImg,2) + ', maxImg: ' + roundVal(maxImg,2));       

        this.drawAxis(minReal, maxReal, minImg, maxImg, zPos);
        
        this.draw();
    },

    drawAxis: function(minX, maxX, minY, maxY, z){
        var lineMaterial = new THREE.LineBasicMaterial({color: '#ffffff', linewidth: 1});
        var geometry = new THREE.Geometry();
        geometry.vertices.push(
            new THREE.Vector3(minX, 0, z),
            new THREE.Vector3(maxX, 0, z)
        );
        var line = new THREE.Line(geometry, lineMaterial);
        line.name = 'axis';
        this.scene.add(line);
        geometry = new THREE.Geometry();
        geometry.vertices.push(
            new THREE.Vector3(0, minY, z),
            new THREE.Vector3(0, maxY, z)
        );
        line = new THREE.Line(geometry, lineMaterial);
        line.name = 'axis';
        this.scene.add(line);
    },

    plotNextFunctionCall: function(func, planeDistance, rChecked, gChecked, bChecked, showPlanes, showDots){       
        var zPos = this.latestPlaneZpos + planeDistance;

        var minFact = Number.MAX_VALUE;
        var maxFact = - Number.MAX_VALUE;
        var avgFact = 0;

        var points = this.pointsHistory[this.pointsHistory.length - 1];
        var lines = [];
        var count = 0;

        var pointsInOnePlane = [];

        for(var i=0; i < points.length; i++){  
                var inputC = points[i];
                var resultC = func(inputC); //FUNCTION CALL
                pointsInOnePlane.push(resultC);
                var resR = resultC.r;
                var resI = resultC.i;
                var fact = inputC.length / resultC.length;        
                if(resultC.length > 0 && !isNaN(resultC.length)){
                    avgFact += fact;
                    count ++;
                    if(fact < minFact)
                        minFact = fact;
                    if(fact > maxFact)
                        maxFact = fact;
                }    
                geometry = new THREE.Geometry();
                geometry.vertices.push(
                    new THREE.Vector3(inputC.r, inputC.i, this.latestPlaneZpos),
                    new THREE.Vector3(resultC.r, resultC.i, zPos)
                );
                var line = new Plotter.Line(inputC, resultC, geometry);
                lines.push(line)
            
        }
        avgFact /= count;
        console.log('minFact: ' + roundVal(minFact,2)); console.log('maxFact: ' + roundVal(maxFact,2)); console.log('avgFact: ' + roundVal(avgFact,2));

        var valCloserToAvg;
        if(Math.abs(avgFact - minFact) < Math.abs(avgFact - maxFact))
             valCloserToAvg = minFact;
        else
            valCloserToAvg = maxFact;
        var diffToAvg = Math.abs(avgFact - valCloserToAvg);
        var colorRangeLowerBound = valCloserToAvg;
        var colorRangeUpperBound = avgFact + diffToAvg;
        var colorRangeSpanning = colorRangeUpperBound - colorRangeLowerBound;

        for(var i=0; i < lines.length; i++){
            var inputC = lines[i].inputC;
            var resultC = lines[i].resultC;  
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
            var lineMaterial = new THREE.LineBasicMaterial({color: colStr, linewidth: 1});
            this.scene.add(new THREE.Line(lines[i].threeLineGeometry, lineMaterial));

            if(showDots){
                var sphereMaterial = new THREE.MeshLambertMaterial({color: colStr});
                // spheres in input plane
                var sphereRadius = 0.1;//TODO
                var sphereGeometry = new THREE.SphereGeometry(sphereRadius, 16, 16);
                var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
                sphere.position.set(inputC.r, inputC.i, this.latestPlaneZpos);
                sphere.name = 'dot';
                this.scene.add(sphere);
                //spheres in target plane
                var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
                sphere.position.set(resultC.r, resultC.i, zPos);
                sphere.name = 'dot';
                this.scene.add(sphere);
            }
        }

        if(showPlanes)
            this.drawPlane(pointsInOnePlane, zPos);

        this.latestPlaneZpos = zPos;
        this.pointsHistory.push(pointsInOnePlane);
    }
/*    
    removeElements: function(){ //TODO on unchecking checkboxes and on re-checking them
        var bin = [];
        this.scene.traverse (function (obj){
            if (obj.name == 'plane' || obj.name == 'dot' || obj.name == 'axis')
                bin.push(obj);
        });
        for(var i=0; i < bin.length; i++)
            this.scene.remove(bin[i]);
    }
*/
};

Plotter.Line = function(inputC, resultC, threeLineGeometry){
    this.inputC = inputC;
    this.resultC = resultC;
    this.threeLineGeometry = threeLineGeometry;
};
