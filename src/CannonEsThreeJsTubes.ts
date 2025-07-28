import * as THREE from 'three';
import { SkinnedMesh, Bone, Skeleton, TubeGeometry, AxesHelper } from 'three';
import * as CANNON from 'cannon-es';

export class CannonTubeRig extends SkinnedMesh {

    readonly bodies: CANNON.Body[];
    readonly constraints: CANNON.PointToPointConstraint[];
    readonly bones: THREE.Bone[]

    get tail() {
        return this.bodies.at(-1)!
    }
    get head() {
        return this.bodies[0]
    }

    private _tension = 0;
    private _segmentLength;

    get tension() {
        return this._tension;
    }

    set tension(v:number) {
        this._tension = v;

        this.constraints.forEach( c => {
             c.pivotB.x = -this._segmentLength/2 + this._segmentLength*v
        })
    }

    /** 
     * @param length In world units, how long the segment will be...
     * @param segments How many times to subdivide the tube... more = more definition
     */
    constructor(length: number, segments: number, radius=0.1, radialSegments=8, debug=false ) {


        const bodies = [];
        const constraints = [];
        const bones = [];

        const segmentLength = length / segments;

        // Create Cannon bodies
        for (let i = 0; i <= segments; i++) {
            const body = new CANNON.Body({
                mass: 1,
                shape: new CANNON.Sphere(segmentLength / 2.1),
                collisionResponse: i > 0
            });
            body.position.set(i * segmentLength, 0, 0);
            //world.addBody(body);
            bodies.push(body);

            if (i > 0) {
                const constraint = new CANNON.PointToPointConstraint(
                    bodies[i - 1], new CANNON.Vec3(segmentLength / 2, 0, 0),
                    bodies[i], new CANNON.Vec3(-segmentLength / 2, 0, 0)
                );
                //world.addConstraint(constraint);
                constraints.push(constraint);
            }
        }

        // Create curve for initial mesh
        const curve = new THREE.CatmullRomCurve3(
            bodies.map(b => new THREE.Vector3(b.position.x, b.position.y, b.position.z))
        );

        const geometry = new TubeGeometry(curve, segments, radius, radialSegments, false);

        // Create bones and skin indices/weights
        const skinIndices = [];
        const skinWeights = [];

        const rootBone = new Bone();
        rootBone.position.set(0, 0, 0);
        bones.push(rootBone);

        for (let i = 1; i <= segments; i++) {
            const bone = new Bone();
            bone.position.set(segmentLength * i, 0, 0);
            //bones[i - 1].add(bone);
            bones.push(bone);

            if( debug )
                bone.add(new AxesHelper(.1))
        }

        const skeleton = new Skeleton(bones);

        const position = geometry.attributes.position;
        const vertex = new THREE.Vector3();

        for (let i = 0; i < position.count; i++) {
            vertex.fromBufferAttribute(position, i);
            const boneIndex = Math.round((vertex.x / length) * (segments));
            skinIndices.push(boneIndex, 0, 0, 0);
            skinWeights.push(1, 0, 0, 0);
        }

        geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
        geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));

        super(geometry);

        bones.forEach(bone => this.add(bone));
        this.bind(skeleton)
        

        this.bodies = bodies;
        this.constraints = constraints;
        this.bones = bones;
        this._segmentLength = segmentLength;
    }

    /**
     * Adds bodies and Constrains of this tube to the world...
     */
    addToPhysicalWorld(world: CANNON.World) {
        this.bodies.forEach(b => world.addBody(b));
        this.constraints.forEach(c => world.addConstraint(c));
    }

    /**
     * Removes bodies and Constrains of this tube from the world...
     */
    removeFromPhysicalWorld(world: CANNON.World) {
        this.bodies.forEach(b => world.removeBody(b));
        this.constraints.forEach(c => world.removeConstraint(c));
    }

    /**
     * Makes the bones align with the CANNON-ES physical bodies
     */
    syncRig() {
 
        //this.mesh.position.set(rootPos.x, rootPos.y, rootPos.z);

        // this.constraints.forEach( c => {
        //     c.pivotB.y += 0.0001
        // })

        //
        // sync the bones with the physicl objects
        //
        for (let i = 0; i < this.bodies.length; i++) {
            const body = this.bodies[i];
            const bone = this.bones[i];
            const prev = this.bones[i - 1]


            // 1. world transform from cannon
            const pos = new THREE.Vector3().copy(body.position); 
 

            // bone.updateMatrixWorld()
            // 2. convert to the bone’s parent space
            if (bone.parent) {
                bone.parent.worldToLocal(pos);
                // quaternions are absolute, so we just copy
            }

            // 3. set local transform
            bone.position.copy(pos);

            if (prev) {
                bone.lookAt(new THREE.Vector3().copy(this.bodies[i - 1].position))
                bone.rotateY(Math.PI / 2)

                if (i == 1) {
                    prev.lookAt(new THREE.Vector3().copy(this.bodies[i].position))
                    prev.rotateY(-Math.PI / 2)
                }

            }


        }
    }
}
