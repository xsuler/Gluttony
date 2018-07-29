import * as THREE from '../libs/three.min';
import * as OIMO from '../libs/oimo.min';

export default class Me {
    refresh(rad,pos){
        this.rad=rad;

        let geometry = new THREE.SphereGeometry(this.rad, 64, 64);

        let faceVertexUvs = geometry.faceVertexUvs[0];
        for (let i = 0; i < faceVertexUvs.length; i++) {
            let uvs = faceVertexUvs[i];
            let face = geometry.faces[i];
            for (let j = 0; j < 3; j++) {
                uvs[j].x = face.vertexNormals[j].x * 0.5 + 0.5;
                uvs[j].y = face.vertexNormals[j].y * 0.5 + 0.5;
            }
        }

        this.mesh = new THREE.Mesh(geometry, this.material);
        this.mesh.receiveShadow = true;
        this.mesh.castShadow = true;
        this.group.position.x = pos[0];
        this.group.position.y = pos[1];
        this.group.position.z = pos[2];
        this.score=10*this.rad;

        let body = this.world.add({
            type: 'sphere',
            name:'me',
            density: 1,
            friction: 0.99,
            restitution: 0.7,
            move: true,
            size: [this.rad, 64, 64],
            pos: pos,
            world: this.world
        });

        this.body=body;

    }
    constructor(world,infoloader) {
        this.world=world;
        this.infoloader=infoloader;

        let texture = new THREE.TextureLoader().load("res/image/eyeball.jpg");

        this.material = new THREE.MeshPhysicalMaterial({
            roughness: 0.4,
            clearCoat: 0.6,
            clearCoatRoughness: 0.8,
            reflectivity: 1,
            envMap: null,
            map:texture
        });

        this.group = new THREE.Group();

        this.scale=[1,1,1];

        let rad=5;
        this.orad=rad;

        let pos = [this.getRandomR(500, -500), this.getRandomR(100, 10), this.getRandomR(500, -500)];

        this.refresh(rad,pos);

        this.group.add(this.mesh);

        this.forcer = 500;
        this.once = 0;
        this.iforce = 0;
        this.force = new THREE.Vector3();
        this.forceFlag = 0;
        this.lastRad = 0;
    }
    impulse(radians) {

        if (this.once === 0) {
            this.direction = new THREE.Vector3(0, 0, -1);
            this.once = 1;
        }
        if (this.forceFlag === 1) return;

        this.forceFlag = 1;
        setTimeout(() => {
            this.group.position.copy(this.body.getPosition());
            this.mesh.quaternion.copy(this.body.getQuaternion());
            let rd0 = Math.atan2(this.direction.z, this.direction.x);
            this.force.fromArray([Math.cos(rd0 - radians), 0, Math.sin(rd0 - radians)]);
            this.force.multiplyScalar(this.forcer);

            this.iforce = 1;
            this.forceFlag = 0;
            this.lastRad = radians;
        }, 50);

    }
    getRandomR(max, min) {
        return min + (Math.random() * Math.floor(max - min));
    }
    unimpulse() {
        this.iforce = 0;
    }
    update() {
        this.mesh.scale.set(this.scale[0],this.scale[1],this.scale[2]);
        this.group.position.copy(this.body.getPosition());
        this.mesh.quaternion.copy(this.body.getQuaternion());

        if (this.once === 0) return;


        if (this.iforce) {
            this.body.applyImpulse(this.body.getPosition(), this.force);
        }

        if (this.body.linearVelocity.length() >= 15) {
            this.direction.copy(this.body.linearVelocity);
            this.direction.normalize();
        }

        let v = new THREE.Vector3();
        v.copy(this.body.linearVelocity);

        if (this.world.checkContact('me','wall')){
            let sd = wx.createInnerAudioContext();
            sd.src = 'res/music/hit.mp3';
            sd.play();
        }
        if (this.world.checkContact('me','ground')){

            if(Math.abs(v.y)>2){
                let sd = wx.createInnerAudioContext();
                sd.src = 'res/music/hit.mp3';
                sd.play();
            }
        }
        if(v.length()>=100){
            v.normalize();
            v.multiplyScalar(-500);
            this.body.applyImpulse(this.body.getPosition(), v);
        }
    }
}
