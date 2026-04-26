import * as THREE from "https://esm.sh/three@0.160.0";
import { GLTFLoader } from "https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js";

// container
const container = document.getElementById("scene");

// scène
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

// caméra
const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
);
camera.position.set(0, 6, 12);

// renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

// contrôles souris
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// lumières
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(10, 15, 10);
dirLight.castShadow = true;
scene.add(dirLight);

// sol
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshStandardMaterial({ color: 0x111111 })
);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);

// loader GLB
const loader = new GLTFLoader();

loader.load(
    "../model/circuit.glb",
    (gltf) => {
        const model = gltf.scene;

        model.scale.set(1,1,1);
        model.position.set(0,0,0);

        model.traverse((child) => {
            if(child.isMesh){
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(model);
    },
    undefined,
    (error) => {
        console.error("Erreur chargement GLB :", error);
    }
);

// animation
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// resize propre
window.addEventListener("resize", () => {
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
});