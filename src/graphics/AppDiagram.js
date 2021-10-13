import store from "../store/index.js";

export default class Diagram extends PIXI.Container {
  constructor(app) {
    super();
    const { stage, view, resources, events, appData, fontSize } = app;
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
    Object.assign(this, { app, stage, view, resources, events, appData, fontSize });
    this.textOpts = {
      fontFamily: "KantarBrown",
      fontWeight: "400",
      align: "center",
      fontSize: fontSize | 20,
      fill: 0xffffff,
    };
    this.init();
  }
  init() {
    if (this.showRulers) {
      this.drawRulers();
    }
    this.initVideo().then(() => {
      this.drawGraphics();
      this.ready = true;
      this.enter();
    });
    // console.log("SCENE READY");
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

  initVideo() {
    const { vw, /* vh,*/ cx, cy } = this.sceneBounds();

    const vidMask = new PIXI.Graphics().beginFill(0x121212).drawCircle(cx, cx, vw / 3.75);
    this.addChild(vidMask);

    // video resource
    const vidRes = new PIXI.resources.VideoResource("static/assets/video-texture.mp4", {
      autoLoad: false,
      autoPlay: false,
      muted: true,
    });
    // for autoplay
    vidRes.source.muted = true;

    return new Promise((resolve, reject) => {
      // Video mask
      vidRes
        .load()
        .then(() => {
          const vidTex = new PIXI.Texture.from(vidRes);
          const video = new PIXI.Sprite.from(vidTex);
          video.interactive = true;
          video.anchor.set(0.5);
          video.position.x = cx;
          video.position.y = cy;
          video.width = video.height = vw / 1.75;
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
          resolve();
        })
        .catch((err) => {
          console.log(err);
          reject();
        });
    });
  }
  drawGraphics() {
    const { app, appData, textOpts } = this;
    const { vw, /* vh,*/ cx, cy } = this.sceneBounds();

    this.rightArcs = new PIXI.Container();
    this.leftArcs = new PIXI.Container();

    this.rightArcs.position.set(cx, cy);
    this.leftArcs.position.set(cx, cy);
    appData.mainArcs.forEach((arcData, i) => {
      let arc;
      if ((i === 2) | (i === 3)) {
        arc = this.drawArc(arcData.label, true, arcData._id);
      } else {
        arc = this.drawArc(arcData.label, false, arcData._id);
      }
      arc.angle = i * 60 + 30;
      this.arcs[i] = arc;
      if (i < 3) {
        this.rightArcs.addChild(arc);
      } else {
        this.leftArcs.addChild(arc);
      }
    });
    this.addChild(this.rightArcs, this.leftArcs);

    // black inner ring

    let ringContainer = new PIXI.Container();
    ringContainer.buttonMode = true;
    ringContainer.interactive = true;
    ringContainer.pivot.set(cx, cy);
    ringContainer.position.x = cx;
    ringContainer.position.y = cy;
    let blkRad = vw / 3.4;
    let blackRing = new PIXI.Graphics().beginFill(0x000000).drawTorus(cx, cy, vw / 3.8, vw / 3.1);
    ringContainer.addChild(blackRing);

    let blkRingFontSize = textOpts.fontSize * 0.8;
    let label1 = this.arcText(blkRad, appData.blackRing.label, blkRingFontSize, 0xffffff, false);
    let labelPx1 = cx;
    let labelPy1 = cy - blkRad - blkRingFontSize / 2;
    label1.position.x = labelPx1;
    label1.position.y = labelPy1;
    let labelPx2 = Math.sin(Math.radians(60)) * (blkRad + blkRingFontSize / 2) + cx;
    let labelPy2 = Math.cos(Math.radians(60)) * (blkRad + blkRingFontSize / 2) + cy;
    let labelPx3 = Math.sin(Math.radians(-60)) * (blkRad + blkRingFontSize / 2) + cx;
    let labelPy3 = Math.cos(Math.radians(-60)) * (blkRad + blkRingFontSize / 2) + cy;
    let label2 = this.arcText(blkRad, appData.blackRing.label, blkRingFontSize, 0xffffff, true);
    let label3 = this.arcText(blkRad, appData.blackRing.label, blkRingFontSize, 0xffffff, true);
    ringContainer.addChild(label1, label2, label3);
    label2.angle = 120;
    label2.position.x = labelPx2;
    label2.position.y = labelPy2;
    label3.angle = 240;
    label3.position.x = labelPx3;
    label3.position.y = labelPy3;

    ringContainer.on("mouseover", () =>
      blackRing
        .clear()
        .beginFill(0x121212)
        .drawTorus(cx, cy, vw / 3.8, vw / 3.1)
    );
    ringContainer.on("mouseout", () =>
      blackRing
        .clear()
        .beginFill(0x000000)
        .drawTorus(cx, cy, vw / 3.8, vw / 3.1)
    );

    ringContainer.on("pointerdown", () => {
      store.commit("toggleModal", true);
      store.commit("selectSection", appData.blackRing._id);
    });
    this.addChild(ringContainer);

    //gold ring

    let goldRing = new PIXI.Graphics().lineStyle(6, 0x000000).drawCircle(cx, cy, vw / 3.75);

    let ringTex = new PIXI.Sprite(app.resources.grad_tex.texture);
    ringTex.anchor.set(0.5);
    ringTex.position.x = cx;
    ringTex.position.y = cy;
    ringTex.angle = 90;
    ringTex.width = vw;
    ringTex.height = vw;
    ringTex.mask = goldRing;
    this.addChild(goldRing, ringTex);

    const centreCirc = new PIXI.Graphics().beginFill(0x121212).drawCircle(cx, cx, vw / 3.75 - 3);
    centreCirc.alpha = 0.5;

    let mainTitle = new PIXI.Text(appData.title, {
      ...this.textOpts,
      fontSize: this.textOpts.fontSize * 1.375,
    });
    mainTitle.anchor.set(0.5);
    mainTitle.position.set(cx, cy);
    mainTitle.resolution = 2;
    mainTitle.style.trim = true;
    mainTitle.updateText();

    let innerLinkTop = this.linkUnderline(appData.centreLinkTop.label);
    innerLinkTop.position.set(cx, cy - vw / 3.75 / 2);
    let innerLinkBottom = this.linkUnderline(appData.centreLinkBottom.label);
    innerLinkBottom.position.set(cx, cy + vw / 3.75 / 2);

    this.addChild(centreCirc, mainTitle, innerLinkTop, innerLinkBottom);

    this.drawOuterShape();

    //  outer labels

    let labelRad = this.getBounds().width / 2 + textOpts.fontSize / 2;
    let outerLabelContainer1 = new PIXI.Container();
    let outerLabel1 = this.arcText(
      labelRad,
      appData.outerLinkRight.label,
      textOpts.fontSize,
      0x5f5e6c,
      false,
      0xffffff
    );
    outerLabelContainer1.position.set(cx + labelRad, cy);
    outerLabelContainer1.angle = 90;
    outerLabelContainer1.addChild(outerLabel1.bgSprite, outerLabel1.tSprite);
    outerLabelContainer1.interactive = true;
    outerLabelContainer1.buttonMode = true;
    this.addChild(outerLabelContainer1);
    outerLabelContainer1.on("mouseover", () => {
      outerLabel1.tSprite.tint = 0x000000;
    });
    outerLabelContainer1.on("mouseout", () => {
      outerLabel1.tSprite.tint = 0xffffff;
    });

    let outerLabelContainer2 = new PIXI.Container();
    let outerLabel2 = this.arcText(
      labelRad,
      appData.outerLinkLeft.label,
      textOpts.fontSize,
      0x5f5e6c,
      false,
      0xffffff
    );
    outerLabelContainer2.position.set(cx - labelRad, cy);
    outerLabelContainer2.angle = -90;
    outerLabelContainer2.addChild(outerLabel2.bgSprite, outerLabel2.tSprite);
    outerLabelContainer2.interactive = true;
    outerLabelContainer2.buttonMode = true;
    this.addChild(outerLabelContainer2);
    outerLabelContainer2.on("mouseover", () => {
      outerLabel2.tSprite.tint = 0x000000;
    });
    outerLabelContainer2.on("mouseout", () => {
      outerLabel2.tSprite.tint = 0xffffff;
    });

    app.stage.addChild(this);
  }
  linkUnderline(linkTxt) {
    const { textOpts } = this;
    const { cx, cy } = this.sceneBounds();
    const { fontSize } = textOpts;
    let container = new PIXI.Container();
    container.interactive = true;
    container.buttonMode = true;
    container.position.set(cx, cy);
    let txt = new PIXI.Text(linkTxt, {
      ...textOpts,
    });
    txt.anchor.set(0.5);
    container.addChild(txt);
    let { width } = container.getBounds();
    let underline = new PIXI.Graphics()
      .lineStyle(2, 0xffffff)
      .moveTo(-width / 2, fontSize / 2)
      .lineTo(width / 2, fontSize / 2);
    underline.alpha = 0;
    container.on("mouseover", () => {
      underline.alpha = 1;
    });
    container.on("mouseout", () => {
      underline.alpha = 0;
    });
    container.addChild(underline);

    return container;
  }
  drawArc(labelTxt, flipTxt, pageId) {
    const { vw } = this.sceneBounds();
    const { resources, textOpts } = this;
    const arc = new PIXI.Container();
    const innerRad = vw / 3.1;
    const rad = vw / 2.75;
    const outerRad = vw / 2.4;
    /*     arc.x = cx;
    arc.y = cy; */
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
      store.commit("selectSection", pageId);
    });
    const { fontSize } = textOpts;
    let label = this.arcText(rad, labelTxt, fontSize, 0xffffff, flipTxt);
    label.position.y = -rad - fontSize / 2;
    arc.addChild(label);

    return arc;
  }
  arcText(radius, label, fontSize, fill, flipY, bgFill) {
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
    let maxRopePoints = 200;
    let step = Math.PI / maxRopePoints;
    let container = new PIXI.Container();

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
    // optional bg - return as separate sprite so text can be tinted on hover
    let bgSprite;
    if (typeof bgFill === "number") {
      let bgContainer = new PIXI.Container();
      let ropeBg = ropePoints - 2;
      let bgPoints = [];
      for (let i = maxRopePoints - ropeBg; i > ropeBg; i--) {
        let x = rad * Math.cos(step * i);
        if (flipY === true) {
          x *= -1;
        }
        let y = rad * Math.sin(step * i);
        bgPoints.push(new PIXI.Point(x, -y));
      }
      let bgGfx = new PIXI.Graphics();
      bgGfx.beginFill(bgFill).drawRect(0, 0, text.texture.width, text.texture.height);
      let bgTex = app.renderer.generateTexture(bgGfx);
      let bg = new PIXI.SimpleRope(bgTex, bgPoints);
      bgContainer.addChild(bg);
      let bgRenderTexture = app.renderer.generateTexture(bgContainer);
      bgSprite = new PIXI.Sprite(bgRenderTexture);
      bgSprite.anchor.set(0.5, 0);
      bgSprite.scale.x = bgSprite.scale.y = 0.5;
      bgSprite.tint = 0xffffff;
    }

    let rope = new PIXI.SimpleRope(text.texture, points);
    container.addChild(rope);

    let renderTexture = app.renderer.generateTexture(container);

    let tSprite = new PIXI.Sprite(renderTexture);
    tSprite.anchor.set(0.5, 0);
    tSprite.scale.x = tSprite.scale.y = 0.5;
    tSprite.tint = 0xffffff;
    // app.stage.addChild(text);
    if (typeof bgFill === "number") {
      return { tSprite, bgSprite };
    } else {
      return tSprite;
    }
  }
  drawOuterShape() {
    const { app } = this;
    const { cx, cy, vw } = this.sceneBounds();
    let rad = (this.getBounds().width / 2) * 1.1;
    let px = rad * Math.cos(Math.radians(5));
    let py = rad * Math.sin(Math.radians(5));
    let gfx = new PIXI.Graphics();
    gfx.position.x = cx;
    gfx.position.y = cy;
    gfx.angle = -90;
    gfx
      .lineStyle(2, 0x000000, 1)
      .moveTo(rad - 20, 10)
      .lineTo(px, py)
      .arc(0, 0, rad, Math.radians(5), Math.radians(175))
      .lineTo(-rad + 20, 10)
      .moveTo(-rad + 20, -10)
      .lineTo(-px, -py)
      .arc(0, 0, rad, Math.radians(185), Math.radians(355))
      .lineTo(rad - 20, -10);

    let tex = new PIXI.Sprite(app.resources.grad_tex.texture);
    tex.anchor.set(0.5);
    tex.position.x = cx;
    tex.position.y = cy;
    tex.angle = 90;
    tex.width = vw;
    tex.height = vw;
    tex.mask = gfx;
    this.addChild(gfx, tex);
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
