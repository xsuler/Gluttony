// score & game over
// ranking

import * as THREE from '../libs/three.min';
import * as OIMO from '../libs/oimo.min';
import TWEEN from '../libs/Tween';

import World from './world';
import Params from './params';
import Me from './me';

let GameParams = new Params();

export default class Game {
    constructor(renderer) {
        this.renderer = renderer;

        this.scene = new THREE.Scene();
        this.scene.add(new THREE.PointLight(0x8A8A8A));
        this.scene.add(new THREE.AmbientLight(0xFFFFFF));

        this.world = new World(this.scene);
        this.initGame();
    }
    initGame() {
        this.loadlight();
        this.loadplayer();
        this.loadMusic();
        this.acceEvent();
        this.touchEvent();
    }
    loadMusic() {
        let bgm = wx.createInnerAudioContext();
        bgm.autoplay = true;
        bgm.loop = true;
        bgm.src = 'res/music/loop.mp3';
        wx.onShow(() => {
            bgm.play();
        });
    }
    acceEvent() {
        let magic = new THREE.Vector3(-0.75, -0.02, -0.61);
        let zero = new THREE.Vector3(0.02, -0.75, 0);
        zero.normalize();
        wx.onAccelerometerChange((res) => {
            let vr = new THREE.Vector3(res.x, res.y, res.z);
            vr.cross(magic);
            vr.cross(magic);
            let vt = new THREE.Vector3();
            vt.copy(zero);
            vt.cross(magic);
            vt.normalize();

            let vs = new THREE.Vector3();
            vs.copy(vr);
            vs.projectOnVector(zero);
            let dx = vs.x / zero.x;
            vs.copy(vr);
            vs.projectOnVector(vt);
            let dy = vs.x / vt.x;

            let rad = Math.atan2(dx, dy);
            this.me.impulse(-rad - Math.PI);
        });
    }
    touchEvent() {
        wx.onTouchStart((e) => {
            this.onTouchS(e);
        });
        wx.onTouchEnd((e) => {
            this.onTouchE(e);
        });
        wx.onTouchMove((e) => {
            this.onTouchM(e);
        });
        wx.onTouchCancel((e) => {
            this.onTouchC(e);
        });
    }
    loadplayer() {
        this.me = new Me(this.world.world);
        this.me.group.position.y = 10;
        this.scene.add(this.me.group);

        this.camera = new THREE.PerspectiveCamera(45, GameParams.cameraAspect, .1, 4000);
        this.me.group.add(this.camera);
        this.camera.position.z = 40;
        this.camera.position.y = 10;
        this.camera.lookAt(this.me.mesh.position);

        this.world.createOthers(this.me);
        this.camTflag = 0;
    }
    loadlight() {
        let spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(100, 1000, 100);
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;
        spotLight.shadow.camera.near = 500;
        spotLight.shadow.camera.far = 4000;
        spotLight.shadow.camera.fov = 30;
        this.scene.add(spotLight);
    }

    onTouchS(e) {
        this.touchid = e.touches[0].identifier;
        this.rposx = e.touches[0].screenX;
        this.rposy = e.touches[0].screenY;
    }
    onTouchC(e) {
        this.me.unimpulse();
    }
    onTouchE(e) {
        this.me.unimpulse();
    }
    onTouchM(e) {
        if (e.touches[0].identifier != this.touchid) return;
        let dx = e.touches[0].screenX - this.rposx;
        let dy = e.touches[0].screenY - this.rposy;
        this.me.impulse(Math.atan2(dx, dy) - Math.PI);
    }

    cameraUpdate() {
        let camT = {
            x: -8 * this.me.rad * this.me.direction.x,
            y: 2 * this.me.rad,
            z: -8 * this.me.rad * this.me.direction.z,
        };
        let camF = new THREE.Vector3();
        camF.copy(this.camera.position);

        let dis = camF.distanceTo(new THREE.Vector3(camT.x, camT.y, camT.z));
        if (this.camTflag === 0 && dis < 25) {
            this.camera.position.copy(camT);
            this.camera.lookAt(this.me.mesh.position);
        } else if (this.camTflag === 0) {

            this.camTflag = 1;
            let camera = this.camera;
            let me = this.me;
            let ts = this;

            let tween = new TWEEN.Tween(camF).to(camT, 500)
                .easing(TWEEN.Easing.Linear.None)
                .onUpdate(function() {
                    camera.position.x = camF.x;
                    camera.position.y = camF.y;
                    camera.position.z = camF.z;
                    camera.lookAt(me.mesh.position);
                })
                .onComplete(function() {
                    camera.lookAt(me.mesh.position);
                    ts.camTflag = 0;
                });
             tween.start();
        }
        TWEEN.update();
    }

    update() {
        this.me.update();
        this.world.update();

        if (this.me.once === 1)
            this.cameraUpdate();
    }

    render() {
        this.update();
        this.renderer.render(this.scene, this.camera);
    }
}
