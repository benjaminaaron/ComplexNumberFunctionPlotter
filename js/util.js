function randomColor(){
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

function showPoint(x, y, z){
    var col = randomColor();
    var sphereGeometry = new THREE.SphereGeometry(0.6);
    var sphereMaterial = new THREE.MeshLambertMaterial({color: col});
    var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(x, y, z);
    scene.add(sphere);
}

function dist(x1, y1, z1, x2, y2, z2){
    return Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2) + Math.pow(z2-z1,2));
}

function roundVal(val, decPlaces){
    if(val !== Math.ceil(val)){ //if has decimal places
        var fact = Math.pow(10,decPlaces);
        return Math.round(val * fact) / fact;
    } else {
        return val;
    }
}

function convertFn(string) {
    return Function("c", "return " + string + ";");
};
