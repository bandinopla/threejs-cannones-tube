![cover](https://github.com/bandinopla/threejs-cannones-tube/raw/main/cover.jpg)
# Threejs + CANNON-es = TUBES!!
Ever felt a deep existential sadness because making flexible 3D tubes that obey physics is a total brain-melter? Of course you did! Me too! So I bullied a few of my brain cells into holding hands, forming a support group, and conjuring up this lovely little package to make the pain go away. You're welcome.

# Installation
This uses [ThreeJs](https://threejs.org/) and [Cannon-es](https://pmndrs.github.io/cannon-es/)
```
npm install threejs-cannones-tube
```

# Use
```js
import { CannonTubeRig } from 'threejs-cannones-tube'
const tube = new CannonTubeRig(
    1, // length in world units 
    20, // resolution along the segment's length
    0.02, // radius of the tube
    8 // resolution along the radius
    ); //<- extends SkinnedMesh
tube.material = new THREE.MeshPhysicalMaterial({ color: 0xff0000 })
scene.add(tube)
tube.addToPhysicalWorld(world); // word = your CANNON.World

function update() {
    //your update function....
    tube.syncRig(); //<-- will align the bones witht  he physical bodies 
}
```

# Align
To align the tube, move the object like any other Object3D and use `lootAt` to make the tube point at a specific target point...

```js
 tube.position.copy( targetPosition )
 tube.lookAt( somePointOfInterest)
```

# Tension
You can tweak a property `tension` that is a number uset to scale the offset between segments... effectively contracting or exanding it will make the tube longer or shorter...

```js
tube.tension = 1.3; // tweak this...
```

**this will reposition the physical bodies and update their offsets** I haven't tested changing these for animating only during setup to place the tube where I want before starting the simulation. (before the first render)

# Remove
```js
tube.removeFromPhysicalWorld( world )
tube.removeFromParent()
```
