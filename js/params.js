let instance;

export default class Params {
    constructor() {
        if (instance) {
            return instance;
        };
        instance = this;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.cameraAspect = this.width / this.height;
        this.ratio = window.devicePixelRatio;
    }
}
