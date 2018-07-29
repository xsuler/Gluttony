// sky
// better texture
// performance
// doc

import * as THREE from '../libs/three.min';
import * as OIMO from '../libs/oimo.min';
import Enemy from './enemy.js';

export default class World {
    constructor(scene) {
        this.scene = scene;
        this.world = new OIMO.World({
            timestep: 1 / 60,
            iterations: 8,
            broadphase: 2,
            worldscale: 1,
            random: true,
            info: false,
            gravity: [0, -50, 0]
        });
        this.wall = [];
        this.wallBody = [];
        this.initWorld();
    }
    initWorld() {
        this.world.clear();
        this.sqr = 1100;

        this.loadground();
        this.loadwall();
        this.loadsky();

        this.enemy = new Map();
        this.nak = 30;
        this.nwk = 10;
    }
    loadsky(){

        let skyGeo = new THREE.SphereGeometry(3000, 128, 128);

        let loader  = new THREE.TextureLoader();
        let texture = loader.load( "res/image/eyeball.jpg" );

        let faceVertexUvs = skyGeo.faceVertexUvs[0];
        for (let i = 0; i < faceVertexUvs.length; i++) {
            let uvs = faceVertexUvs[i];
            let face =skyGeo.faces[i];
            for (let j = 0; j < 3; j++) {
                uvs[j].x = face.vertexNormals[j].x * 0.5 + 0.5;
                uvs[j].y = face.vertexNormals[j].y * 0.5 + 0.5;
            }
        }

        let material = new THREE.MeshPhongMaterial({
            map: texture,
        });

        let sky = new THREE.Mesh(skyGeo, material);
        sky.material.side = THREE.BackSide;
        this.scene.add(sky);
    }
    loadground() {
        let texture = new THREE.TextureLoader().load("res/image/eyeball.jpg", function(texture) {

            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.offset.set(0, 0);
            texture.repeat.set(1, 1);

        });

        let material = new THREE.MeshPhysicalMaterial({
            metalness: 0,
            roughness: 0.5,
            clearCoat: 0.4,
            clearCoatRoughness: 0.5,
            reflectivity: 0.3,
            envMap: null,
            map: texture
        });

        this.ground = new THREE.Mesh(new THREE.BoxGeometry(this.sqr, 100, this.sqr), material);
        this.ground.receiveShadow = true;
        this.ground.castShadow = true;
        this.ground.position.y = -50;
        this.scene.add(this.ground);

        this.groundBody = this.world.add({
            size: [this.sqr + 100, 100, this.sqr + 100],
            name: 'body',
            pos: [0, -50, 0],
            friction: 0.99,
            restitution: 0.3,
            world: this.world
        });
    }
    loadwall() {
        for (let i = 0; i < 4; i++) {
            let size = [];
            let rot = [];
            let pos = [];

            if (i <= 1)
                size = [this.sqr, 100, 500];
            else
                size = [500, 100, this.sqr];


            if (i <= 1)
                rot = [90, 0, 0];
            else
                rot = [0, 0, 90];

            if (i === 0)
                pos = [0, 250, this.sqr / 2 + size[1] / 2];
            else if (i === 1)
                pos = [0, 250, -this.sqr / 2 - size[1] / 2];
            else if (i === 2)
                pos = [this.sqr / 2 + size[1] / 2, 250, 0];
            else if (i === 3)
                pos = [-this.sqr / 2 - size[1] / 2, 250, 0];

            this.wallBody[i] = this.world.add({
                size: size,
                name: 'wall',
                pos: pos,
                rot: rot,
                friction: 0.5,
                restitution: 0.3,
                world: this.world
            });
        }
    }

    createOthers(me) {
        for (let i = 0; i < this.nak + this.nwk; i++) {
            let ene = new Enemy(this.scene, this.enemy, me, this.world, i, i < this.nak ? 0 : 1);
            this.enemy.set(i, ene);
            this.scene.add(ene.mesh);
        }
    }
    update() {
        this.world.step();
        this.enemy.forEach((ene) => {
            ene.update();
        });
    }
}
