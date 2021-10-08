export default class Diagram extends PIXI.Container {
  constructor(app) {
    super();
    const { stage, view, resources, events } = app;
    this.showRulers = true;
    this.ready = false;
    events.on("WINDOW_RESIZE", () => {
      if (this.onStage) {
        if (this.showRulers) {
          this.drawRulers();
        }
        this.positionGraphics();
      }
    });
    Object.assign(this, { app, stage, view, resources, events });
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
    let { cx, cy } = this.sceneBounds();
    if (!this.rulers) {
      this.rulers = new PIXI.Graphics();
    } else {
      this.rulers.clear();
    }
    this.rulers.lineStyle(2, 0x00ff99, 0.5);
    // this.rulers.drawRect(hexLeft, hexTop, hexWidth, hexHeight);
    this.rulers.moveTo(0, -cy).lineTo(0, cy).moveTo(-cx, 0).lineTo(cx, 0);
    this.addChild(this.rulers);
  }
  createArc() {
    const { vw, /* vh, */ cx, cy } = this.sceneBounds();
    const { resources } = this;
    const arc = new PIXI.Container();
    const radius = vw / 1.82;

    arc.x = cx;
    arc.y = cy;
    arc.interactive = true;
    const arcBase = new PIXI.Sprite(resources.arc_base.texture);
    arcBase.anchor.set(0.5, 0);
    arcBase.width = vw / 2.25;
    arcBase.scale.y = arcBase.scale.x;
    const arcHover = new PIXI.Sprite(resources.arc_hover.texture);
    arcHover.anchor.set(0.5, 0);
    arcHover.width = vw / 2.25;
    arcHover.scale.y = arcHover.scale.x;
    arcHover.alpha = 0;
    arc.addChild(arcBase, arcHover);
    arcBase.angle = arcHover.angle = -1.3;
    arcBase.y = arcHover.y = -radius;
    arc.on("mouseover", () => {
      gsap.to(arcHover, { alpha: 1, duration: 0.3, ease: "power2.out" });
      // arcHover.alpha = 1;
    });
    arc.on("mouseout", () => {
      // arcHover.alpha = 0;
      gsap.to(arcHover, { alpha: 0, duration: 0.3, ease: "power2.out" });
    });
    arc.buttonMode = true;
    return arc;
  }
  drawArc() {
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
      // arcHover.alpha = 1;
    });
    arc.on("mouseout", () => {
      // arcHover.alpha = 0;
      gsap.to(arcHover, { alpha: 0, duration: 0.3, ease: "power2.out" });
    });
    // 4+ * target size to smooth it out
    let fontSize = 18;
    let label = this.arcText(rad, "Streaming data", fontSize, 0xffffff);
    label.position.y = -rad - fontSize / 2;
    // label.width = vw / 4;
    // label.scale.y = label.scale.x = 0.2;
    arc.addChild(label);

    return arc;
  }
  arcText(radius, label, fontSize, fill) {
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

    let renderTexture = app.renderer.generateTexture(container, {
      scaleMode: PIXI.SCALE_MODES.LINEAR,
      resolution: window.devicePixelRatio,
      multisample: PIXI.MSAA_QUALITY.HIGH,
    });

    let tSprite = new PIXI.Sprite(renderTexture);
    tSprite.anchor.set(0.5, 0);
    tSprite.scale.x = tSprite.scale.y = 0.5;
    app.stage.addChild(text);
    return tSprite;
  }
  drawGraphics() {
    const { app } = this;
    const { vw, /* vh,*/ cx, cy } = this.sceneBounds();

    // create the arcs
    /*   let arcTex = app.resources.arc_base.texture;
    genHitmap(arcTex.baseTexture, 127);
    const arc1 = this.createArc();
    arc1.angle = 30;
    const arc2 = this.createArc();
    arc2.angle = 90;
    const arc3 = this.createArc();
    arc3.angle = 150;
    const arc4 = this.createArc();
    arc4.angle = 210;
    const arc5 = this.createArc();
    arc5.angle = 270;
    const arc6 = this.createArc();
    arc6.angle = 330;

    this.addChild(arc1, arc2, arc3, arc4, arc5, arc6); */

    const arc1 = this.drawArc();
    this.addChild(arc1);

    /* /// black circle
    const blackCirc = new PIXI.Container();
    blackCirc.interactive = true;
    blackCirc.buttonMode = true;
    const blackCircBase = new PIXI.Graphics();
    blackCircBase
      .beginFill(0x000000, 1)
      .drawCircle(cx, cy, vw / 3)
      .endFill();
    const blackCircHover = new PIXI.Graphics();
    blackCircHover
      .beginFill(0x262626, 1)
      .drawCircle(cx, cy, vw / 3)
      .endFill();
    blackCircHover.alpha = 0;
    blackCirc.addChild(blackCircBase, blackCircHover);
    blackCirc.on("mouseover", () => {
      gsap.to(blackCircHover, { alpha: 1, duration: 0.3, ease: "power2.out" });
    });
    blackCirc.on("mouseout", () => {
      gsap.to(blackCircHover, { alpha: 0, duration: 0.3, ease: "power2.out" });
    });
    const circMask = new PIXI.Graphics()
      .lineStyle(vw / 20, 0xffffff)
      .drawCircle(cx, cy, vw / 3.3)
      .moveTo(cx, cy);
    const maskTex = app.renderer.generateTexture(circMask);
    genHitmap(maskTex.baseTexture, 127);
    const maskSprite = new PIXI.Sprite(maskTex);
    circMask.interactive = true;
    circMask.buttonMode = true;
    blackCirc.mask = maskSprite;
    this.addChild(blackCirc);
 */

    /* const blackRingGfx = new PIXI.Graphics()
      .lineStyle(vw / 20, 0x000000)
      .drawCircle(cx, cy, vw / 3.3);
    const ringTex = app.renderer.generateTexture(blackRingGfx);
    genHitmap(ringTex.baseTexture, 127);
    const ringSprite = new PIXI.Sprite(ringTex);
    ringSprite.interactive = true;
    ringSprite.buttonMode = true;
    this.addChild(ringSprite);
 */

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

    // centre circ
    const centreCirc = new PIXI.Graphics().beginFill(0x121212).drawCircle(cx, cx, vw / 3.75 - 3);
    centreCirc.interactive = true;
    centreCirc.buttonMode = true;
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
  onRouteUpdate(data) {
    if (this.routes.indexOf(data.to.name) >= 0) {
      if (!this.ready) {
        this.init();
      } else {
        this.enter();
      }
    } else {
      this.leave();
    }
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
/**
 * https://www.pixiplayground.com/#/edit/EOxtz6zy7rsr2ryzzPNBC
 * pixel perfect interaction
 */
PIXI.Sprite.prototype.containsPoint = function (point) {
  const tempPoint = { x: 0, y: 0 };
  //get mouse poisition relative to the bunny anchor point
  this.worldTransform.applyInverse(point, tempPoint);
  // console.error('temppoint:' + tempPoint);

  const width = this._texture.orig.width;
  const height = this._texture.orig.height;
  const x1 = -width * this.anchor.x;
  let y1 = 0;

  let flag = false;
  //collision detection for sprite (as a square, not pixel perfect)
  if (tempPoint.x >= x1 && tempPoint.x < x1 + width) {
    y1 = -height * this.anchor.y;

    if (tempPoint.y >= y1 && tempPoint.y < y1 + height) {
      flag = true;
    }
  }
  //if collision not detected return false
  if (!flag) {
    return false;
  }

  //if not continues from here

  // bitmap check
  const tex = this.texture;
  const baseTex = this.texture.baseTexture;
  const res = baseTex.resolution;

  if (!baseTex.hitmap) {
    //generate hitmap
    if (!genHitmap(baseTex, 255)) {
      return true;
    }
  }

  const hitmap = baseTex.hitmap;

  // console.log(hitmap);
  // this does not account for rotation yet!!!

  //check mouse position if its over the sprite and visible
  let dx = Math.round((tempPoint.x - x1 + tex.frame.x) * res);
  let dy = Math.round((tempPoint.y - y1 + tex.frame.y) * res);
  let ind = dx + dy * baseTex.realWidth;
  let ind1 = ind % 32;
  let ind2 = (ind / 32) | 0;
  return (hitmap[ind2] & (1 << ind1)) !== 0;
};
///********///
function genHitmap(baseTex, threshold) {
  //check sprite props
  if (!baseTex.resource) {
    //renderTexture
    console.log(baseTex);
    return false;
  }
  const imgSource = baseTex.resource.source;
  let canvas = null;
  if (!imgSource) {
    return false;
  }
  let context = null;
  if (imgSource.getContext) {
    canvas = imgSource;
    context = canvas.getContext("2d");
  } else if (imgSource instanceof Image) {
    canvas = document.createElement("canvas");
    canvas.width = imgSource.width;
    canvas.height = imgSource.height;
    context = canvas.getContext("2d");
    context.drawImage(imgSource, 0, 0);
  } else {
    //unknown source;
    return false;
  }

  const w = canvas.width,
    h = canvas.height;
  let imageData = context.getImageData(0, 0, w, h);
  //create array
  let hitmap = (baseTex.hitmap = new Uint32Array(Math.ceil((w * h) / 32)));
  //fill array
  for (let i = 0; i < w * h; i++) {
    //lower resolution to make it faster
    let ind1 = i % 32;
    let ind2 = (i / 32) | 0;
    //check every 4th value of image data (alpha number; opacity of the pixel)
    //if it's visible add to the array
    if (imageData.data[i * 4 + 3] >= threshold) {
      hitmap[ind2] = hitmap[ind2] | (1 << ind1);
    }
  }
  return true;
}
