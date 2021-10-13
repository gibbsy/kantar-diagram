import bus from "./eventBus.js";
import Diagram from "./AppDiagram.js";
import manifest from "./manifest.js";

export default class AppGfx extends PIXI.Application {
  constructor(el, appData, fontSize) {
    const domElement = el;

    PIXI.settings.PRECISION_FRAGMENT = "highp";

    // Converts from degrees to radians.
    Math.radians = function (degrees) {
      return (degrees * Math.PI) / 180;
    };

    // Converts from radians to degrees.
    Math.degrees = function (radians) {
      return (radians * 180) / Math.PI;
    };

    super({
      width: domElement.offsetWidth,
      height: domElement.offsetHeight,
      backgroundColor: 0x000000,
      antialias: true,
      autoResize: true,
      transparent: true,
      autoDensity: true,
      resolution: window.devicePixelRatio,
    });
    this.appData = appData;
    this.domElement = domElement;
    this.loaded = 0;
    this.animating = true;
    this.rendering = true;
    this.resizing = false;
    this.diagram = undefined;
    this.events = bus;
    // this.stage = new PIXI.display.Stage();
    // this.init();
    this.load(() => {
      this.init();
    });
  }
  get resources() {
    return this.loader.resources;
  }
  load(callback) {
    this.loader.add(manifest).load(() => {
      callback();
      this.init();
    });
    this.loader.onProgress.add((e) => {
      bus.emit("LOAD_PROGRESS", e.progress);
    });
  }

  init() {
    // called after assets have loaded
    const { view, events, stage } = this;
    stage.interactive = true;
    this.domElement.appendChild(view);

    window.addEventListener("resize", () => {
      let delay = 500;
      // debounce the resize event
      if (this.resizing) {
        window.clearTimeout(this.resizing);
      }
      this.resizing = window.setTimeout(this.onResize.bind(this), delay);
    });

    events.on("USER_ACTION", (e) => {
      this.userAction(e);
    });
    this.diagram = new Diagram(this);
  }
  onResize() {
    const { renderer, view, events } = this;
    const el = view.parentNode;
    renderer.resize(el.clientWidth, el.clientHeight);
    events.emit("WINDOW_RESIZE");
  }
  appBounds() {
    const { view } = this;
    let vw = view.width;
    let vh = view.height;
    let cx = vw / 2;
    let cy = vh / 2;
    return { vw, vh, cx, cy };
  }
  userAction(e) {}
  animate(delta) {
    this.events.emit("animate", delta);
  }
}
