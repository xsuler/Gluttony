import * as THREE from '../libs/three.min';
import * as OIMO from '../libs/oimo.min';

export default class Enemy {
    refresh(rad, pos) {
        this.rad = rad;
        this.orad = rad;
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
        this.mesh.position.x = pos[0];
        this.mesh.position.y = pos[1];
        this.mesh.position.z = pos[2];

        let body = this.world.add({
            type: 'sphere',
            density: 1,
            friction: 0.99,
            restitution: 0.7,
            move: true,
            size: [this.rad, 64, 64],
            pos: pos,
            world: this.world
        });

        this.body = body;
    }

    constructor(scene, set, me, world, id, type) {
        this.world = world;
        this.scene = scene;
        this.set = set;
        this.me = me;
        this.id = id;
        this.type = type;

        this.initobj();
        this.move();
    }
    initobj() {
        let texture = new THREE.TextureLoader().load("res/image/" + (this.type !== 0 ? "eyeball.png" : "attacker.jpg"));
        this.material = new THREE.MeshPhysicalMaterial({
            roughness: 0.4,
            clearCoat: 0.6,
            clearCoatRoughness: 0.8,
            reflectivity: 1,
            envMap: null,
            map: texture
        });

        this.scale = [1, 1, 1];

        let radt = this.getRandomR(7, 3);
        let pos = [this.getRandomR(500, -500), this.getRandomR(100, 10), this.getRandomR(500, -500)];

        this.refresh(radt, pos);
    }

    move() {
        this.force = new THREE.Vector3();
        this.forceFlag = 0;
        this.timer = setInterval(() => {
            this.randTimer(() => {
                let min = 999999;
                let mpos = new THREE.Vector3();
                if (this.type === 1)
                    mpos.copy(this.me.body.getPosition());
                else {
                    this.set.forEach((x) => {
                        if (x.id === this.id) return;
                        if (x.type === 1) return;
                        let v = new THREE.Vector3();
                        v.copy(x.mesh.position);
                        let dis = v.distanceTo(this.mesh.position);
                        if (dis < min) {
                            min = dis;
                            mpos.copy(x.body.getPosition());
                        }
                    });
                }
                let epos = this.body.getPosition();
                mpos.sub(epos);
                mpos.y = 0;
                mpos.normalize();
                this.force.copy(mpos);
                this.force.multiplyScalar(this.getRandomR(500, 200));
            });

        }, this.getRandomR(200, 10));
    }

    randTimer(func) {
        func();
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.randTimer(func);
        }, this.getRandomR(10000, 1000));
    }

    getRandomR(max, min) {
        return min + (Math.random() * Math.floor(max - min));
    }
    playHit() {
        let sd = wx.createInnerAudioContext();
        if (this.type === 1)
            sd.src = 'res/music/hit.mp3';
        else
            sd.src = 'res/music/eat.mp3';
        sd.play();
    }
    updateMove() {
        this.mesh.scale.set(this.scale[0], this.scale[1], this.scale[2]);
        this.mesh.position.copy(this.body.getPosition());
        this.mesh.quaternion.copy(this.body.getQuaternion());

        if (this.forceFlag === 0) {
            this.forceFlag = 1;
            setTimeout(() => {
                this.forceFlag = 0;
                this.body.applyImpulse(this.body.getPosition(), this.force);
            }, 50);
        }
        let v = new THREE.Vector3();
        v.copy(this.body.linearVelocity);
        if (v.length() >= 100) {
            v.normalize();
            v.multiplyScalar(-500);
            this.body.applyImpulse(this.body.getPosition(), v);
        }
    }
    updateSound() {
        if (this.type === 1) {
            if (this.world.getContact(this.me.body, this.body))
                this.playHit();
        }
    }
    HitEnemy(a, b) {
        let tpos = new THREE.Vector3(this.getRandomR(500, -500), this.getRandomR(100, 50), this.getRandomR(500, -500));
        let trad = this.getRandomR(7, 3);
        a.body.shapes.radius = trad;
        a.scale = a.scale.map((x) => trad / a.orad);
        a.body.resetPosition(tpos.x, tpos.y, tpos.z);
        a.rad = trad;
        let scale = 1.01 * Math.pow((Math.pow(b.rad, 3) + Math.pow(a.rad, 3)) / Math.pow(b.rad, 3), 1);
        let rad = b.rad * scale;
        b.rad = rad;
        b.scale = b.scale.map((x) => x * scale);
        b.body.shapes.radius = b.rad;
        let pos = b.body.getPosition();
        pos.y += rad * (scale - 1);
        b.body.resetPosition(pos.x, pos.y, pos.z);
    }
    update() {
        this.updateMove();
        this.updateSound();
        if (this.type === 1) return;
        this.set.forEach((x) => {
            if (x.id === this.id) return;
            if (x.type === 1) return;
            if (this.world.getContact(x.body, this.body)) {
                if (this.mesh.position.distanceTo(this.me.mesh.position) < 50)
                    this.playHit();
                if (x.rad >= this.rad) {
                    this.HitEnemy(this, x);
                } else {
                    this.HitEnemy(x, this);
                }
            }
        });

        if (this.world.getContact(this.me.body, this.body)) {
            this.playHit();
            if (this.me.rad >= this.rad) {
                this.HitEnemy(this, this.me);
                if (10 * this.me.rad > this.me.score) {
                    this.me.score = 10 * this.me.rad;
                }
            } else {
                this.HitEnemy(this.me, this);
                if (10 * this.me.rad > this.me.score) {
                    this.me.score = 10 * this.me.rad;
                }
            }
        }
    }
}
