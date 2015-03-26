var container, scene, camera, renderer, controls;
var geometry, sphereGeometry, material, lineMaterial, planeMaterial, sphereMaterial;

var inputPlaneWidth = 10;
var inputPlaneHeight = 10;
var inputToResultPlaneDiff = 30;

//var resultPlaneWidth = 20;
//var resultPlaneHeight = 20;

var Line = function(inputC, resultC, threeLineGeometry){
    this.inputC = inputC;
    this.resultC = resultC;
    this.threeLineGeometry = threeLineGeometry;
};

function init() {
    scene = new THREE.Scene();
    var SCREEN_WIDTH = window.innerWidth,
        SCREEN_HEIGHT = window.innerHeight,

        VIEW_ANGLE = 45,
        ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
        NEAR = 0.1,
        FAR = 20000;

    camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
    camera.position.set(50,40,50);
    camera.lookAt(scene.position);
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setClearColor(0xeeeeee);
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

    container = document.getElementById('ThreeJS');
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);

    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1);
    scene.add(light);

    light = new THREE.DirectionalLight(0x002288);
    light.position.set(-1, -1, -1);
    scene.add(light);

    light = new THREE.AmbientLight(0x222222);
    scene.add(light);
    //var axes = new THREE.AxisHelper(20); scene.add(axes);

    // INPUT PLANE
    geometry = new THREE.PlaneBufferGeometry(inputPlaneWidth, inputPlaneHeight, 32);
    planeMaterial = new THREE.MeshBasicMaterial({color: 0xbbbbbb, side: THREE.DoubleSide, transparent: true, opacity: 0.5});
    var plane = new THREE.Mesh(geometry, planeMaterial);
    //plane.position.set(0, 0, 0);
    scene.add(plane);


    // DRAW LINES
    var steps = 1;
    var resultMinReal = Number.MAX_VALUE;
    var resultMaxReal = - Number.MAX_VALUE;
    var resultMinImg = Number.MAX_VALUE;
    var resultMaxImg = - Number.MAX_VALUE;

    //material = new THREE.LineBasicMaterial({color: 'rgb(0, 255, 0)', linewidth: 4});

    var lines = [];

    var minFact = Number.MAX_VALUE;
    var maxFact = - Number.MAX_VALUE;

    //do the calculations
    for(var r = - inputPlaneWidth / 2; r <= inputPlaneWidth / 2; r = r + steps){
        for(var i = - inputPlaneHeight / 2; i <= inputPlaneHeight / 2; i = i + steps){
            var inputC = new C(r, i);
            var resultC = inputC.pow(2); //FUNCTION
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

            geometry = new THREE.Geometry();
            geometry.vertices.push(
                new THREE.Vector3(inputC.r, inputC.i, 0),
                new THREE.Vector3(resultC.r, resultC.i, inputToResultPlaneDiff)
            );
            var line = new Line(inputC, resultC, geometry);
            lines.push(line)
        }
    }
    //console.log(minFact); console.log(maxFact);



    //calculate colors and add lines and circles to the scene
    for(var i=0; i < lines.length; i++){
        var inputC = lines[i].inputC;

        var resultC = lines[i].resultC;
        var fact = inputC.length / resultC.length;
        if(isNaN(fact))
            fact = 0;
        else
            fact = Math.pow(fact, 0.5);

        sphereGeometry = new THREE.SphereGeometry(0.1 + 0.2 * fact, 16, 16);

        fact = Math.round((1 - fact) * 255);
        var colStr = 'rgb(' + 0 + ',' + 0 + ',' + fact + ')';
        lineMaterial = new THREE.LineBasicMaterial({color: colStr, linewidth: 1});
        sphereMaterial = new THREE.MeshLambertMaterial({color: colStr});

        var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(inputC.r, inputC.i, 0);
        scene.add(sphere);

        var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(resultC.r, resultC.i, inputToResultPlaneDiff);
        scene.add(sphere);

        scene.add(new THREE.Line(lines[i].threeLineGeometry, lineMaterial));
    }

    // RESULT PLANE
    var resultPlaneWidth = resultMinReal * -1 + Math.abs(resultMaxReal);
    var resultPlaneHeight = resultMinImg * -1 + Math.abs(resultMaxImg);
    geometry = new THREE.PlaneBufferGeometry(resultPlaneWidth, resultPlaneHeight, 32);
    plane = new THREE.Mesh(geometry, planeMaterial);
    var middleDiffReal = resultMinReal + resultPlaneWidth / 2;
    var middleDiffImg = resultMinImg + resultPlaneHeight / 2;
    //console.log(resultMinReal); console.log(resultMaxReal); console.log(resultMinImg); console.log(resultMaxImg);
    //console.log(resultPlaneWidth); console.log(resultPlaneHeight); console.log(middleDiffReal); console.log(middleDiffImg);
    plane.position.set(middleDiffReal, middleDiffImg, inputToResultPlaneDiff);
    scene.add(plane);
}


function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
