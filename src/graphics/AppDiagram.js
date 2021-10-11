import store from "../store/index.js";

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

  drawArc(labelTxt, flipTxt) {
    const { vw, /* vh, */ cx, cy } = this.sceneBounds();
    const { /* app, */ resources } = this;
    const arc = new PIXI.Container();
    const innerRad = vw / 3.1;
    const rad = vw / 2.75;
    const outerRad = vw / 2.4;
    arc.x = cx;
    arc.y = cy;
    arc.interactive = true;
    // const rad = vw / 1.75;

    const arcHover = new PIXI.Sprite(resources.grad_tex.texture);
    arcHover.anchor.set(0.5);
    arcHover.width = vw / 2.25;
    arcHover.height = vw / 5;
    arcHover.position.y = -rad;

    const tor1 = new PIXI.Graphics();
    tor1
      .beginFill(0x262626)
      .drawTorus(0, 0, innerRad, outerRad, Math.radians(-119), Math.radians(-61))
      .endFill();
    arcHover.mask = tor1;
    arcHover.interactive = true;
    arcHover.buttonMode = true;
    arcHover.alpha = 0;
    const arcBase = new PIXI.Graphics();
    arcBase
      .beginFill(0x262626)
      .drawTorus(0, 0, innerRad, outerRad, Math.radians(-119), Math.radians(-61))
      .endFill();
    arcBase.interactive = true;
    arcBase.buttonMode = true;
    arc.addChild(arcBase, tor1, arcHover);
    arc.on("mouseover", () => {
      gsap.to(arcHover, { alpha: 1, duration: 0.3, ease: "power2.out" });
      label.tint = 0x262626;
      // arcHover.alpha = 1;
    });
    arc.on("mouseout", () => {
      // arcHover.alpha = 0;
      gsap.to(arcHover, { alpha: 0, duration: 0.3, ease: "power2.out" });
      label.tint = 0xffffff;
    });
    arc.on("pointerdown", () => {
      console.log(labelTxt);
      store.commit("toggleModal", true);
      store.commit("selectSection", labelTxt);
    });
    let fontSize = 20;
    let label = this.arcText(rad, labelTxt, fontSize, 0xffffff, flipTxt);
    label.position.y = -rad - fontSize / 2;
    arc.addChild(label);

    return arc;
  }
  arcText(radius, label, fontSize, fill, flipY) {
    /**
     * https://jsfiddle.net/themoonrat/12u1nhnq/1/
     */
    // Resulting sprite coming out blurry so doubling radius and fontSize
    // then scaling down at the end as a workaround
    const { app } = this;
    let rad = radius * 2;
    let text = new PIXI.Text(label, {
      fontFamily: "KantarBrown",
      fontWeight: "400",
      fontSize: fontSize * 2,
      fill: fill | 0x000000,
    });
    text.resolution = 2;
    text.style.trim = true;
    text.updateText();
    let maxRopePoints = 500;
    let step = Math.PI / maxRopePoints;

    let ropePoints =
      maxRopePoints - Math.round((text.texture.width / (rad * Math.PI)) * maxRopePoints);
    ropePoints /= 2;

    let points = [];
    for (let i = maxRopePoints - ropePoints; i > ropePoints; i--) {
      let x = rad * Math.cos(step * i);
      if (flipY === true) {
        x *= -1;
      }
      let y = rad * Math.sin(step * i);
      points.push(new PIXI.Point(x, -y));
    }

    let container = new PIXI.Container();
    /* let textTexture = app.renderer.generateTexture(text, {
      scaleMode: PIXI.SCALE_MODES.LINEAR,
      resolution: 2,
    }); */
    let rope = new PIXI.SimpleRope(text.texture, points);
    app.stage.addChild(rope);
    container.addChild(rope);

    let renderTexture = app.renderer.generateTexture(container);

    let tSprite = new PIXI.Sprite(renderTexture);
    tSprite.anchor.set(0.5, 0);
    tSprite.scale.x = tSprite.scale.y = 0.5;
    tSprite.tint = 0xffffff;
    // app.stage.addChild(text);
    return tSprite;
  }
  drawGraphics() {
    const { app, appData } = this;
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
      this.addChild(centreCirc, text);
    });

    appData.mainArcs.forEach((arcData, i) => {
      let arc;
      if ((i === 2) | (i === 3)) {
        arc = this.drawArc(arcData.label, true);
      } else {
        arc = this.drawArc(arcData.label);
      }
      arc.angle = i * 60 + 30;
      this.arcs[i] = arc;
      this.addChild(arc);
    });

    const blackCirc = new PIXI.Graphics()
      .beginFill(0x000000)
      .drawTorus(cx, cy, vw / 3.8, vw / 3.1)
      .drawTorus(cx, cy, vw / 3.8, vw / 3.1);
    blackCirc.interactive = true;
    blackCirc.buttonMode = true;
    this.addChild(blackCirc);

    //gold ring
    const goldRing = new PIXI.Graphics()
      .lineTextureStyle({
        width: 6,
        texture: app.resources.grad_tex.texture,
      })
      .drawCircle(cx, cy, vw / 3.75);
    this.addChild(goldRing);

    const centreCirc = new PIXI.Graphics().beginFill(0x121212).drawCircle(cx, cx, vw / 3.75 - 3);
    centreCirc.interactive = true;
    centreCirc.buttonMode = true;
    centreCirc.alpha = 0.5;

    let text = new PIXI.Text("label", {
      fontFamily: "KantarBrown",
      fontWeight: "400",
      fontSize: 28,
      fill: 0xcccccc,
    });
    text.position.x = cx;
    text.position.y = cy;
    text.resolution = 2;
    text.style.trim = true;
    text.updateText();

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
