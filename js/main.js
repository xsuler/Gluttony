import * as THREE from '../libs/three.min';

import Params from './params';
import Game from './game';

let GameParams = new Params();

export default class Main {
    constructor() {
        canvas.getContext('webgl');

        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true
        });
        this.renderer.shadowMap.enabled = true;
        this.renderer.setSize(GameParams.width, GameParams.height);
        this.renderer.setClearColor(0xFFFFFF, 1);
        this.renderer.setPixelRatio(GameParams.ratio);
        this.renderer.autoClear = false;

        this.Game = new Game(this.renderer);
        wx.setPreferredFramesPerSecond(60);
        this.loop();
    }

    loop() {
        this.renderer.clear();
        this.Game.render();
        window.requestAnimationFrame(this.loop.bind(this), canvas);
    }
}
