// import store from "../store/index.js";
import bus from "./eventBus.js";

export default class Diagram extends PIXI.Container {
  constructor(app) {
    super();
    const { stage, view, resources, events, appData } = app;
    this.showRulers = false;
    this.ready = false;
    this.arcs = [];
    events.on("WINDOW_RESIZE", () => {
      if (this.onStage) {
        if (this.showRulers) {
          this.drawRulers();
        }
        this.positionGraphics();
      }
    });
    Object.assign(this, { app, stage, view, resources, events, appData });
    this.init();
  }
  init() {
    if (this.showRulers) {
      this.drawRulers();
    }
    this.drawGraphics();
    this.ready = true;
    // console.log("SCENE READY");
    this.enter();
  }
  sceneBounds() {
    // Calculate the bounds of the central hexagon
    // to position and scale the other elements.
    // ** Proprotions of the central hexagon taken from the .ai file.. no dark arts
    const { view } = this;
    let vw = view.width / window.devicePixelRatio;
    let vh = view.height / window.devicePixelRatio;
    let smallScreen = vw < 1440 || vh < 769;
    let cx = vw / 2;
    let cy = vh / 2;

    return {
      vw,
      vh,
      cx,
      cy,
      smallScreen,
    };
  }
  drawRulers() {
    let { vw, vh, cx, cy } = this.sceneBounds();
    if (!this.rulers) {
      this.rulers = new PIXI.Graphics();
    } else {
      this.rulers.clear();
    }
    this.rulers.lineStyle(2, 0x00ff99, 0.5);
    this.rulers.moveTo(0, cy).lineTo(vw, cy).moveTo(cx, 0).lineTo(cx, vh);
    this.addChild(this.rulers);
  }

  drawGraphics() {
    const { app } = this;
    const { vw, /* vh,*/ cx, cy } = this.sceneBounds();

    // Video mask
    const vidMask = new PIXI.Graphics().beginFill(0x121212).drawCircle(cx, cx, vw / 3.75 - 3);
    this.addChildAt(vidMask, 0);

    // video resource
    const vidRes = new PIXI.resources.VideoResource("static/assets/video-texture.mp4", {
      autoLoad: false,
      autoPlay: false,
      muted: true,
    });
    // for autoplay
    vidRes.source.muted = true;
    vidRes.load().then(() => {
      const vidTex = new PIXI.Texture.from(vidRes);
      const video = new PIXI.Sprite.from(vidTex);
      video.interactive = true;
      video.anchor.set(0.5);
      video.position.x = cx;
      video.position.y = cy;
      video.width = video.height = this.width * 0.75;
      video.mask = vidMask;
      video.texture.baseTexture.resource.source.addEventListener("ended", () => {
        vidRes.source.play();
      });
      vidRes.source.play();
      console.log(vidRes);
      this.addChild(video);
      video.on("mouseover", () => {
        vidRes.source.play();
        // video.texture.baseTexture.resource.source.pause();
      });
      video.on("mouseout", () => {
        vidRes.source.play();
        // video.texture.baseTexture.resource.source.pause();
      });
      bus.emit("VIDEO_READY");
    });

    const centreCirc = new PIXI.Graphics().beginFill(0x121212).drawCircle(cx, cx, vw / 3.75 - 3);
    centreCirc.interactive = true;
    centreCirc.buttonMode = true;
    centreCirc.zIndex = 1000;
    // this.addChild(centreCirc);

    app.stage.addChild(this);
  }
  positionGraphics() {}
  onResize(data) {
    /*   let { app, sprite, container, tl_main } = this;
      tl_main.kill();
      tl_main = this.tl_main = null;
      let coords = this.getTransform();
      transformContainer(container, { x: coords.xpos, y: coords.ypos, scaleX: coords.scale, scaleY: coords.scale });
      sprite.scale.x = 1;
      sprite.scale.y = 1;
      this.buildTimeline(); */
  }
  enter() {
    const { stage } = this;
    if (this.onStage) {
      return;
    }
    this.onStage = true;
    this.positionGraphics();
    stage.addChild(this);
    if (this.tl_enter) {
      this.tl_enter.restart();
    }
  }
  leave() {
    const { stage } = this;
    if (!this.onStage) {
      return;
    }
    if (this.tl_enter) {
      this.tl_enter.seek("start");
      this.onStage = false;
      stage.removeChild(this);
    }
    if (this.tl_leave) {
      this.tl_leave.play();
    } else {
      this.onStage = false;
      stage.removeChild(this);
    }
  }
}
