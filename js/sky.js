
var container = document.getElementById('container');

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

var camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, .1, 1000);
camera.position.set(0, 0, 4);

var scene = new THREE.Scene();
scene.background = new THREE.Color('black');

// lights
var aLight = new THREE.AmbientLight(0x7f46ab);
scene.add(aLight);

// ---------------------------------------------------------------
// ---------------------------------------------------------------



// -----------------------------------------------------------------

var sphereGeo = new THREE.SphereBufferGeometry(0.2, 32, 16);


// -----------------------------------------------------------------
// -----------------------------------------------------------------

// moon

var MoonShader = {

    uniforms: {

        colorA: { type: 'v3', value: scene.background },
        colorB: { type: 'v3', value: new THREE.Color('#fff') },

    },

    vertexShader: [

        "varying vec2 vUv;",
        "void main() {",
        "	vUv = uv;",
        "	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"

    ].join('\n'),

    fragmentShader: [

        "varying vec2 vUv;",
        "uniform vec3 colorA;",
        "uniform vec3 colorB;",

        "void main() {",
        " float pct = smoothstep( 0.39, 0.44, vUv.y );",
        "	vec3 col = mix( colorA, colorB, pct );",
        "	gl_FragColor = vec4( col, 1.0 );",
        "}"

    ].join('\n')

};

var moonGeo = new THREE.SphereBufferGeometry(2, 32, 32);
var moonMat = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.clone(MoonShader.uniforms),
    vertexShader: MoonShader.vertexShader,
    fragmentShader: MoonShader.fragmentShader,
});
var moon = new THREE.Mesh(moonGeo, moonMat);
moon.position.set(-3, 4, -20);
moon.rotation.set(
    - Math.PI / 2,
    - Math.PI / 6,
    Math.PI / 4,
);
scene.add(moon);

var moonLight = new THREE.DirectionalLight(0xffffff, 0.8);
moonLight.position.copy(moon.position);
scene.add(moonLight);

//

// key light

var dLight = new THREE.DirectionalLight(0xffffff, 0.2);
dLight.position.set(1, 1, 1);
scene.add(dLight);

// ---------------------------------------------------------------
// ---------------------------------------------------------------

// stars

StarShader = {

    uniforms: {

        color: { type: 'v3', value: new THREE.Color(0xffffff) },
        texture: { type: 't', value: null },
        time: { type: 'f', value: 120 },
        size: { type: 'f', value: 900.0 }

    },

    vertexShader: [

        'uniform float time;',
        'uniform float size;',
        'attribute float alphaOffset;',
        'varying float vAlpha;',
        'uniform vec4 origin;',

        'void main() {',

        'vAlpha = 0.5 * ( 1.0 + sin( alphaOffset + time ) );',

        'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
        'float cameraDist = distance( mvPosition, origin );',
        'gl_PointSize = size / cameraDist;',
        'gl_Position = projectionMatrix * mvPosition;',

        '}'

    ].join('\n'),

    fragmentShader: [

        'uniform float time;',
        'uniform vec3 color;',
        'uniform sampler2D texture;',

        'varying float vAlpha;',

        'void main() {',
        '  gl_FragColor = vec4( color, vAlpha );',
        '  gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );',
        '}'

    ].join('\n')
};

var Stars = function (options) {

    var color = this.color = options.color || 0x333333;
    var size = this.size = options.size || 1;

    var pointCount = this.pointCount = options.pointCount || 40;
    var range = this.range = options.range || new THREE.Vector3(2, 2, 2);

    THREE.Group.call(this);

    // circle texture

    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    var ctx = canvas.getContext('2d');

    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var radius = canvas.width / 3;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = '#fff';
    ctx.fill();

    var texture = new THREE.Texture(canvas);
    texture.premultiplyAlpha = true;
    texture.needsUpdate = true;

    //

    StarShader.uniforms.texture.value = texture;
    StarShader.uniforms.size.value = size;

    var pointsMat = new THREE.ShaderMaterial({
        uniforms: StarShader.uniforms,
        vertexShader: StarShader.vertexShader,
        fragmentShader: StarShader.fragmentShader,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true
    });

    var pointsGeo = new THREE.BufferGeometry();

    var positions = new Float32Array(pointCount * 3);
    var alphas = new Float32Array(pointCount);

    for (var i = 0; i < pointCount; i++) {

        positions[i * 3 + 0] = THREE.Math.randFloatSpread(range.x);
        positions[i * 3 + 1] = THREE.Math.randFloatSpread(range.y);
        positions[i * 3 + 2] = THREE.Math.randFloatSpread(range.z);

        alphas[i] = i;

    }

    pointsGeo.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    pointsGeo.addAttribute('alphaOffset', new THREE.BufferAttribute(alphas, 1));

    var points = this.points = new THREE.Points(pointsGeo, pointsMat);
    points.sortParticles = true;
    points.renderOrder = 1;

    this.add(points);

}

Stars.prototype = Object.create(THREE.Group.prototype);
Stars.prototype.constructor = Stars;

// ---------------------------------------------------------------

var stars = new Stars({
    color: 0xffffff,
    range: new THREE.Vector3(110, 60, 30),
    pointCount: 400,
    size: 700,
    speed: 0.1
});

scene.add(stars);

stars.position.z = -50;

// ---------------------------------------------------------------
// ---------------------------------------------------------------

window.addEventListener('resize', resize, false);
function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

var clock = new THREE.Clock();

renderer.setAnimationLoop(loop);

function loop() {

    var time = clock.getElapsedTime();

 
    stars.points.material.uniforms.time.value = time;

    renderer.render(scene, camera);
}