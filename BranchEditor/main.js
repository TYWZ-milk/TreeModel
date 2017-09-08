var canvas,width,height,renderer,scene,camera,controls,Orbitcontrols;
var tree=[];
var forest=[];
var sequence=-1;
var lbbs;
var css = new Array([6]);
function init() {
    lbbs = new LBBs();
    canvas = document.getElementById("canvas");
    width = window.innerWidth;
    height = window.innerHeight;
    renderer = new THREE.WebGLRenderer({
        antialias:true,
        canvas:canvas
    });
    renderer.setSize(width,height);
    renderer.setClearColor(0xaaaaaa,1.0);

    scene = new THREE.Scene();
    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0,1,1).normalize();
    scene.add(light);
    light = new THREE.AmbientLight(0xffffff,1);
    scene.add(light);


    camera = new THREE.PerspectiveCamera(45,width/height,1,10000);
    camera.position.y = 20;
    camera.position.z = 20;

    controls = new THREE.TransformControls(camera,canvas);
    controls.addEventListener( 'change', render );
    controls.setMode("translate","rotate");
    scene.add(controls);

    Orbitcontrols = new THREE.OrbitControls( camera, renderer.domElement );

    initScene();

    initGUI();
    
    canvas.addEventListener("click",onclick);

    animate();
}
var mesh;
function initScene() {

    var geo = new THREE.PlaneGeometry(200,200,20,20);
    mesh = new THREE.Mesh(geo,new THREE.MeshLambertMaterial({
        wireframe:true,
        color:0x111111
    }));
    mesh.rotateX(-Math.PI/2);
    scene.add(mesh);
}

var parameter = {
    x: 0, y: 30, z: 0,
    background:0xaaaaaa,
    build:build,
    undo:undo,
    redo:redo,
    showWireframe:false,
    MainBranch1:false,
    MainBranch2:false,
    MainBranch3:false,
    MainBranch4:false,
    Branch1:false,
    Branch2:false,
    Branch3:false,
    Branch4:false,
    Branch5:false
};
function undo(){
    if(forest.length>1){
        scene.remove(forest[sequence]);
        scene.add(forest[sequence-1]);
        sequence--;
    }
}
function redo(){
    if(sequence<forest.length-1){
        scene.remove(forest[sequence]);
        scene.add(forest[sequence+1]);
        sequence++;
    }
}
function build() {
    css = new Array([6]);
    scene.remove(forest[sequence]);
    tree = new THREE.Group();
    cs = [];
    if(parameter.MainBranch1)
        MainBranch1();
    else if(parameter.MainBranch2)
        MainBranch2();
    else if(parameter.MainBranch3)
        MainBranch3();
    else
        MainBranch4();
    css.push(cs);
    drawBranch();
    tree.add(branch);
    addBranch();
    addLeaf();
    forest.push(tree);
    sequence=forest.length-1;
    scene.add(tree);
}
var leafMat =null;
var leafMesh = null;
function addLeaf(){
    leafMat = new THREE.MeshLambertMaterial({
        map:THREE.ImageUtils.loadTexture("../textures/tree/leaf01.png"),
        color:0x253F08,
        side:THREE.DoubleSide,
        transparent:true,
        depthTest:false
    });
    for(var i = 1;i<css.length;i++) {
        for(var j = Math.floor(css[i].length/2+Math.floor(Math.random()*4 + 1));j<css[i].length;j+=Math.floor(Math.random()*3 + 1)) {
            for (var k = Math.floor(Math.random() * 6 + 1); k < 6; k++) {
                var phi = Math.random() * 60 + 20;
                var theta = Math.random() * 360;
                var selfRotate = Math.random() * 360;
                var leaf_size = 20;
                var geo = new THREE.PlaneGeometry(leaf_size, leaf_size);
                leafMesh = new THREE.Mesh(geo, leafMat);
                leafMesh.geometry.translate(0, leaf_size / 2.0, 0);
                leafMesh.rotateY(theta / 180 * Math.PI);
                leafMesh.rotateZ(phi / 180 * Math.PI);
                leafMesh.rotateY(selfRotate / 180 * Math.PI);
                leafMesh.position.x = css[i][j].pos.x;
                leafMesh.position.z = css[i][j].pos.z;
                leafMesh.position.y = css[i][j].pos.y;
                tree.add(leafMesh);
            }
        }
    }
}
function addBranch(){
    if(parameter.Branch1) {
        Branch1();
        drawBranch1();
        tree.add(branch);
        css.push(branchcs);
    }
    if(parameter.Branch2){
        Branch2();
        drawBranch2();
       tree.add(branch);
        css.push(branchcs);
    }
    if(parameter.Branch3){
        Branch3();
        drawBranch3();
        tree.add(branch);
        css.push(branchcs);
    }
    if(parameter.Branch4){
        Branch4();
        drawBranch4();
        tree.add(branch);
        css.push(branchcs);
    }
    if(parameter.Branch5){
        Branch5();
        drawBranch5();
        tree.add(branch);
        css.push(branchcs);
    }
}
function drawBranch() {
    var seg = 30;
    var geo = new THREE.Geometry();
    for(var i = 0, l = cs.length; i < l; i ++){
        var circle = cs[i];
        for(var s=0;s<seg;s++){//for each point in the circle
            var rd = circle.radius;
            var pos = new THREE.Vector3(0,0,0);
            pos.x = rd*Math.sin(2*Math.PI/seg*s);
            pos.y = 0;
            pos.z = rd*Math.cos(2*Math.PI/seg*s);
            geo.vertices.push(pos.add(circle.pos));
        }
    }

    for(i=0;i<l-1;i++){
        for(s=0;s<seg;s++){
            var v1 = i*seg+s;
            var v2 = i*seg+(s+1)%seg;
            var v3 = (i+1)*seg+(s+1)%seg;
            var v4 = (i+1)*seg+s;

            geo.faces.push(new THREE.Face3(v1,v2,v3));
            geo.faceVertexUvs[0].push([new THREE.Vector2(s/seg,0),new THREE.Vector2((s+1)/seg,0),new THREE.Vector2((s+1)/seg,1)]);
            geo.faces.push(new THREE.Face3(v3,v4,v1));
            geo.faceVertexUvs[0].push([new THREE.Vector2((s+1)/seg,1),new THREE.Vector2((s)/seg,1),new THREE.Vector2((s)/seg,0)]);
        }
    }//add faces and uv
    geo.computeFaceNormals();
    branch = new THREE.Mesh(geo,new THREE.MeshLambertMaterial({
        // wireframe:true,
        color:0x804000,
        side:THREE.DoubleSide,
        map:THREE.ImageUtils.loadTexture("../textures/tree/branch01.png")
    }));
}
var gui;
function initGUI() {
    gui = new dat.gui.GUI();
    gui.remember(parameter);
    gui.addColor(parameter,"background").onFinishChange(function (e) {
        renderer.setClearColor(e,1.0);
    });
    gui.add(parameter,"showWireframe").name("show wireframe").onFinishChange(function (e) {
        if(tree)
            for(var i =0;i<5;i++)
                tree.children[i].material.wireframe = e;
    });
    var folder1 = gui.addFolder('MainBranch');
    var cubeX = folder1.add( parameter, 'MainBranch1').onFinishChange(function (e) {
        parameter.MainBranch1=e;
    });
    var cubeY = folder1.add( parameter, 'MainBranch2').onFinishChange(function(e){
        parameter.MainBranch2=e;
    });
    var cubeZ = folder1.add( parameter, 'MainBranch3').onFinishChange(function(e){
        parameter.MainBranch3=e;
    });
    var cube4 = folder1.add( parameter, 'MainBranch4').onFinishChange(function(e){
        parameter.MainBranch4=e;
    });
    folder1.open();
    var folder2 = gui.addFolder('Branch');
    var Branch1 = folder2.add( parameter, 'Branch1').onFinishChange(function (e) {
        parameter.Branch1=e;
    });
    var Branch2 = folder2.add( parameter, 'Branch2').onFinishChange(function(e){
        parameter.Branch2=e;
    });
    var Branch3 = folder2.add( parameter, 'Branch3').onFinishChange(function(e){
        parameter.Branch3=e;
    });
    var Branch4 = folder2.add( parameter, 'Branch4').onFinishChange(function(e){
        parameter.Branch4=e;
    });
    var Branch5 = folder2.add( parameter, 'Branch5').onFinishChange(function(e){
        parameter.Branch5=e;
    });
    folder2.open();
    gui.add(parameter,"build");
    gui.add(parameter,"undo");
    gui.add(parameter,"redo");
}


var mouse = new THREE.Vector2();
var selected = null;
var order;
function onclick(event) {
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );

    //屏幕和场景转换工具根据照相机，把这个向量从屏幕转化为场景中的向量
    vector.unproject(camera);

    //vector.sub( camera.position ).normalize()变换过后的向量vector减去相机的位置向量后标准化
    //新建一条从相机的位置到vector向量的一道光线
    var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

    var intersects = raycaster.intersectObjects( tree.children );
    if(intersects.length){
        selected = intersects[0].object;

        controls.attach(selected);
    }else{
     //   gui2.domElement.hidden = true;
    }
}

function animate() {
    controls.update();
    Orbitcontrols.update();
    render();
    lbbs.update();
    requestAnimationFrame(animate);
}

function render() {

    renderer.clear();
    renderer.render(scene,camera);
}