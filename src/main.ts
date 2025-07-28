import './style.css' 

import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import { CannonTubeRig } from './CannonEsThreeJsTubes'
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js'

const gui = new GUI();

const world = new CANNON.World()
// Tweak contact properties.
// Contact stiffness - use to make softer/harder contacts
world.defaultContactMaterial.contactEquationStiffness = 1e9

// Stabilization time in number of timesteps
world.defaultContactMaterial.contactEquationRelaxation = 4
world.gravity.set(0, -10, 0)
const timeStep = 1 / 120
//world.solver.iterations = 20 


const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

window.addEventListener('resize', handleResize);
function handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}


const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(1, 1, 1)
scene.add(light)

camera.position.z = 1
camera.position.x = .5

const tube = new CannonTubeRig(1, 20, 0.02);
tube.material = new THREE.MeshPhysicalMaterial({ color: 0xff0000 })
scene.add(tube)
tube.addToPhysicalWorld(world)

gui.add(tube, "tension", -2, 2)


const pin = new CANNON.Body({
    shape: new CANNON.Sphere(0.01),
    mass: 0,
    type: CANNON.Body.KINEMATIC,
    collisionResponse: false
})
pin.position.set(1, 0, 0)
world.addBody(pin)

world.addConstraint(new CANNON.PointToPointConstraint(tube.tail, new CANNON.Vec3(0, 0, 0), pin, new CANNON.Vec3(0, 0, 0)))

const p0 = new CANNON.Body({
    shape: new CANNON.Sphere(0.01),
    mass: 0,
    type: CANNON.Body.KINEMATIC,
    collisionResponse: false
})
world.addBody(p0)
world.addConstraint(new CANNON.PointToPointConstraint(tube.head, new CANNON.Vec3(0, 0, 0), p0, new CANNON.Vec3(0, 0, 0)))


const clock = new THREE.Clock()
function animate() {
    requestAnimationFrame(animate)

    pin.position.x = 1 + Math.cos(performance.now() / 990) * .3

    world.step(timeStep, clock.getDelta(), 6);
    tube.syncRig(); 
    renderer.render(scene, camera)
}
animate()
