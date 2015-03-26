
var Plotter = function() {
    var SCREEN_WIDTH = window.innerWidth,
        SCREEN_HEIGHT = window.innerHeight,

        VIEW_ANGLE = 45,
        ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
        NEAR = 0.1,
        FAR = 20000;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
    this.camera.position.set(50,40,50);
    this.camera.lookAt(this.scene.position);
    this.scene.add(this.camera);

    this.renderer = new THREE.WebGLRenderer({antialias:true});
    this.renderer.setClearColor(0xeeeeee);
    this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

    this.container = document.getElementById('ThreeJS');
    this.container.appendChild(this.renderer.domElement);

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1);
    this.scene.add(light);

    light = new THREE.DirectionalLight(0x002288);
    light.position.set(-1, -1, -1);
    this.scene.add(light);

    light = new THREE.AmbientLight(0x222222);
    this.scene.add(light);
    //var axes = new THREE.AxisHelper(20); scene.add(axes);
};

Plotter.prototype = {
    draw: function() {
        requestAnimationFrame(this.draw.bind(this));
        this.renderer.render(this.scene, this.camera);
    },

    clear: function() {
        for(var i = 0; i < this.scene.children.length; ++i) {
            this.scene.remove(this.scene.children[i]);
        }
    },

    start: function(calc, width, height, steps) {
        // INPUT PLANE
        this.geometry = new THREE.PlaneBufferGeometry(width, height, 32);
        this.planeMaterial = new THREE.MeshBasicMaterial({color: 0xbbbbbb, side: THREE.DoubleSide, transparent: true, opacity: 0.5});
        var plane = new THREE.Mesh(this.geometry, this.planeMaterial);
        //plane.position.set(0, 0, 0);
        this.scene.add(plane);

        // DRAW LINES
        var resultMinReal = Number.MAX_VALUE;
        var resultMaxReal = - Number.MAX_VALUE;
        var resultMinImg = Number.MAX_VALUE;
        var resultMaxImg = - Number.MAX_VALUE;

        //material = new THREE.LineBasicMaterial({color: 'rgb(0, 255, 0)', linewidth: 4});

        this.lines = [];

        var minFact = Number.MAX_VALUE;
        var maxFact = - Number.MAX_VALUE;

        //do the calculations
        for(var r = - width / 2; r <= width / 2; r = r + steps){
            for(var i = - height / 2; i <= height / 2; i = i + steps){
                var inputC = new C(r, i);
                var resultC = calc(inputC); //FUNCTION
                var resR = resultC.r;
                var resI = resultC.i;
                var fact = inputC.length / resultC.length;

                console.log(inputC + ' -> ' + resultC + ' fact: ' + roundVal(inputC.length, 1) + '/' + roundVal(resultC.length, 1) + '=' + roundVal(fact, 2));

                if(fact < minFact)
                    minFact = fact;
                if(fact > maxFact)
                    maxFact = fact;

                if(resR < resultMinReal)
                    resultMinReal = resR;
                if(resI < resultMinImg)
                    resultMinImg = resI;
                if(resR > resultMaxReal)
                    resultMaxReal = resR;
                if(resI > resultMaxImg)
                    resultMaxImg = resI;

                var geometry = new THREE.Geometry();
                geometry.vertices.push(
                    new THREE.Vector3(inputC.r, inputC.i, 0),
                    new THREE.Vector3(resultC.r, resultC.i, Plotter.PLANEDIFF)
                );
                var line = new Plotter.Line(inputC, resultC, geometry);
                this.lines.push(line)
            }
        }
        //console.log(minFact); console.log(maxFact);



        //calculate colors and add lines and circles to the scene
        for(var i=0; i < this.lines.length; i++){
            var inputC = this.lines[i].inputC;

            var resultC = this.lines[i].resultC;
            var fact = inputC.length / resultC.length;
            if(isNaN(fact))
                fact = 0;
            else
                fact = Math.pow(fact, 0.5);

            var sphereGeometry = new THREE.SphereGeometry(0.1 + 0.2 * fact, 16, 16);

            fact = Math.round((1 - fact) * 255);
            var colStr = 'rgb(' + 0 + ',' + 0 + ',' + fact + ')';
            var lineMaterial = new THREE.LineBasicMaterial({color: colStr, linewidth: 1});
            var sphereMaterial = new THREE.MeshLambertMaterial({color: colStr});

            var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.set(inputC.r, inputC.i, 0);
            this.scene.add(sphere);

            var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            sphere.position.set(resultC.r, resultC.i, Plotter.PLANEDIFF);
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
        //console.log(resultMinReal); console.log(resultMaxReal); console.log(resultMinImg); console.log(resultMaxImg);
        //console.log(resultPlaneWidth); console.log(resultPlaneHeight); console.log(middleDiffReal); console.log(middleDiffImg);
        this.plane.position.set(middleDiffReal, middleDiffImg, Plotter.PLANEDIFF);
        this.scene.add(this.plane);


        this.draw();
    }
};

Plotter.Line = function(inputC, resultC, threeLineGeometry){
    this.inputC = inputC;
    this.resultC = resultC;
    this.threeLineGeometry = threeLineGeometry;
};
Plotter.PLANEDIFF = 30;
