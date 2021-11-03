import config from "../config.js";
import store from "../store/index.js";
import bus from "./eventBus.js";

export default class Diagram extends PIXI.Container {
  constructor(app) {
    super();
    const { stage, view, resources, events, appData } = app;
    this.ready = false;
    this.resizing = false;
    this.animating = true;
    this.aniPlayed = false;
    // ref to every el with events
    this.castMembers = [];
    this.aniEls = { arcs: [] };
    Object.assign(this, { app, stage, view, resources, events, appData });
    this.textOpts = {
      fontFamily: "KantarBrown",
      fontWeight: "400",
      align: "center",
      fontSize: appData.fontSize | 20,
      fill: 0xffffff,
    };
    events.on("WINDOW_RESIZE", () => {
      this.onResize();
    });
    this.initDiagram();
  }
  initDiagram() {
    this.positionDiagram();
    this.initVideo().then(() => {
      this.setFontSize();
      this.drawGraphics();
      this.ready = true;
      // this.enter();
    });
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
  setFontSize() {
    const { vw } = this.sceneBounds();
    let baseSize = this.appData.fontSize;
    let fontSize;

    if (vw > 1300) {
      fontSize = Math.round(baseSize * 1.5);
    } else if (vw > 1100) {
      fontSize = Math.round(baseSize * 1.25);
    } else if (vw > 900) {
      fontSize = Math.round(baseSize * 1.125);
    } else if (vw > 800) {
      fontSize = baseSize;
    } else if (vw > 700) {
      fontSize = baseSize;
    } else if (vw > 500) {
      fontSize = Math.round(baseSize * 0.75);
    } else {
      fontSize = Math.round(baseSize * 0.625);
    }
    // console.log(fontSize);
    this.textOpts.fontSize = fontSize;
  }
  initVideo() {
    const { vw } = this.sceneBounds();

    const vidMask = new PIXI.Graphics().beginFill(0x121212).drawCircle(0, 0, vw / 3.75);
    this.addChild(vidMask);

    // video resource
    const vidRes = new PIXI.resources.VideoResource(`${config.assetsPath}video-texture.mp4`, {
      autoLoad: false,
      autoPlay: false,
      muted: true,
      crossOrigin: true,
      // loadType: PIXI.loaders.Resource.LOAD_TYPE.XHR,
    });
    // for autoplay
    vidRes.source.muted = true;

    return new Promise((resolve, reject) => {
      // Video mask
      vidRes
        .load()
        .then(() => {
          const centreEls = new PIXI.Container();
          const vidGroup = new PIXI.Container();
          const vidTex = new PIXI.Texture.from(vidRes);
          const video = new PIXI.Sprite.from(vidTex);
          video.anchor.set(0.5);
          video.width = video.height = vw / 1.75;
          video.mask = vidMask;
          video.texture.baseTexture.resource.source.addEventListener("ended", () => {
            vidRes.source.play();
          });
          video.tint = 0xffffff;
          vidRes.source.play();
          centreEls.addChild(vidGroup);
          vidGroup.addChild(vidMask, video);
          this.addChild(centreEls);
          this.aniEls.video = video;
          this.centreEls = centreEls;
          resolve();
        })
        .catch((err) => {
          console.log(err);
          reject();
        });
    });
  }
  positionDiagram() {
    const { cx, cy } = this.sceneBounds();
    this.x = cx;
    this.y = cy;
  }
  drawGraphics() {
    const { app, appData, resources, textOpts } = this;
    const { vw } = this.sceneBounds();

    const rightArcs = new PIXI.Container();
    const leftArcs = new PIXI.Container();

    // rightArcs.position.set(cx, cy);
    // leftArcs.position.set(cx, cy);
    appData.mainArcs.forEach((arcData, i) => {
      let arc;
      if ((i === 2) | (i === 3)) {
        arc = this.drawArc(arcData.label, true, arcData._id);
      } else {
        arc = this.drawArc(arcData.label, false, arcData._id);
      }
      arc.angle = i * 60 + 30;
      this.aniEls.arcs[i] = arc;
      if (i < 3) {
        rightArcs.addChild(arc);
      } else {
        leftArcs.addChild(arc);
      }
    });
    this.addChild(rightArcs, leftArcs);

    // black inner ring

    const ringContainer = new PIXI.Container();
    ringContainer.buttonMode = true;
    ringContainer.interactive = true;
    // ringContainer.pivot.set(cx, cy);
    // ringContainer.position.x = cx;
    // ringContainer.position.y = cy;
    let blkRad = vw / 3.4;
    const blackRing = new PIXI.Graphics().beginFill(0x000000).drawTorus(0, 0, vw / 3.8, vw / 3.1);
    const hoverMask = blackRing.clone();
    // hoverMask.anchor.set(0.5);
    // hoverMask.position.set(cx, cy);
    const ringHover = new PIXI.Sprite(resources.grad_tex.texture);
    ringHover.anchor.set(0.5);
    // ringHover.position.set(cx, cy);
    ringHover.width = vw / 1.5;
    ringHover.height = vw / 1.5;
    ringHover.angle = 90;
    ringHover.mask = hoverMask;
    ringHover.alpha = 0;

    ringContainer.addChild(blackRing, ringHover, hoverMask);

    let blkRingFontSize = Math.round(textOpts.fontSize * 0.9);
    let label1 = this.arcText(blkRad, appData.blackRing.label, blkRingFontSize, 0xffffff, false);
    let labelPx1 = 0;
    let labelPy1 = -blkRad - blkRingFontSize / 2;
    label1.position.x = labelPx1;
    label1.position.y = labelPy1;
    let labelPx2 = Math.sin(Math.radians(60)) * (blkRad + blkRingFontSize / 2);
    let labelPy2 = Math.cos(Math.radians(60)) * (blkRad + blkRingFontSize / 2);
    let labelPx3 = Math.sin(Math.radians(-60)) * (blkRad + blkRingFontSize / 2);
    let labelPy3 = Math.cos(Math.radians(-60)) * (blkRad + blkRingFontSize / 2);
    let label2 = this.arcText(blkRad, appData.blackRing.label, blkRingFontSize, 0xffffff, true);
    let label3 = this.arcText(blkRad, appData.blackRing.label, blkRingFontSize, 0xffffff, true);
    ringContainer.addChild(label1, label2, label3);
    label2.angle = 120;
    label2.position.x = labelPx2;
    label2.position.y = labelPy2;
    label3.angle = 240;
    label3.position.x = labelPx3;
    label3.position.y = labelPy3;
    label1.tint = 0xffffff;
    label2.tint = 0xffffff;
    label3.tint = 0xffffff;

    ringContainer.on("mouseover", () => {
      label1.tint = 0x262626;
      label2.tint = 0x262626;
      label3.tint = 0x262626;
      gsap.to(ringHover, { alpha: 1, duration: 0.3 });
    });
    ringContainer.on("mouseout", () => {
      label1.tint = 0xffffff;
      label2.tint = 0xffffff;
      label3.tint = 0xffffff;
      gsap.to(ringHover, { alpha: 0, duration: 0.3 });
    });

    ringContainer.on("pointerdown", () => {
      this.clickHandler(appData.blackRing._id);
    });
    this.addChild(ringContainer);
    this.castMembers.push(ringContainer);

    const centreCirc = new PIXI.Graphics().beginFill(0x121212).drawCircle(0, 0, vw / 3.75);
    centreCirc.alpha = 0.5;
    // centreCirc.pivot.set(cx, cy);
    let str = appData.title;
    const mainTitle = new PIXI.Text(str, {
      ...this.textOpts,
      fontSize: this.textOpts.fontSize * 1.375,
    });
    mainTitle.anchor.set(0.5);
    mainTitle.resolution = 2;
    mainTitle.style.trim = true;
    mainTitle.updateText();

    const innerLinkTop = this.linkUnderline(appData.centreLinkTop.label);
    innerLinkTop.position.set(0, -vw / 3.75 / 2);
    const innerLinkBottom = this.linkUnderline(appData.centreLinkBottom.label);
    innerLinkBottom.position.set(0, vw / 3.75 / 2);
    innerLinkTop.on("pointerdown", () => {
      this.clickHandler(appData.centreLinkTop._id);
    });
    innerLinkBottom.on("pointerdown", () => {
      this.clickHandler(appData.centreLinkBottom._id);
    });

    this.centreEls.addChild(centreCirc, mainTitle, innerLinkTop, innerLinkBottom);
    this.castMembers.push(centreCirc, mainTitle, innerLinkTop, innerLinkBottom);

    //gold ring
    let ringWidth = vw < 400 ? 3 : 5;
    const goldRing = new PIXI.Container();
    const ringMask = new PIXI.Graphics().lineStyle(ringWidth, 0x000000).drawCircle(0, 0, vw / 3.75);
    const ringTex = new PIXI.Sprite(app.resources.grad_tex.texture);
    ringTex.anchor.set(0.5);
    ringTex.angle = 90;
    ringTex.width = vw / 1.5;
    ringTex.height = vw / 1.5;
    ringTex.mask = ringMask;
    goldRing.addChild(ringMask, ringTex);
    this.aniEls.goldRing = goldRing;
    this.addChild(goldRing);

    this.outerGfxLeft = new PIXI.Container();
    this.outerGfxRight = new PIXI.Container();
    this.drawOuterShape();

    //  outer labels

    let labelRad = Math.round(this.sceneBounds().vw / 2.2 + textOpts.fontSize / 2);
    const outerLabelContainerRight = new PIXI.Container();
    let outerLabelRight = this.arcText(
      labelRad,
      appData.outerLinkRight.label,
      textOpts.fontSize,
      0x5f5e6c,
      false,
      0xffffff
    );
    outerLabelContainerRight.position.set(labelRad, 0);
    outerLabelContainerRight.angle = 90;
    outerLabelContainerRight.addChild(outerLabelRight.bgSprite, outerLabelRight.tSprite);
    outerLabelContainerRight.interactive = true;
    outerLabelContainerRight.buttonMode = true;
    outerLabelContainerRight.on("mouseover", () => {
      outerLabelRight.tSprite.tint = 0x000000;
    });
    outerLabelContainerRight.on("mouseout", () => {
      outerLabelRight.tSprite.tint = 0xffffff;
    });
    outerLabelContainerRight.on("pointerdown", () => {
      this.clickHandler(appData.outerLinkRight._id);
    });
    let outerLabelContainerLeft = new PIXI.Container();
    let outerLabelLeft = this.arcText(
      labelRad,
      appData.outerLinkLeft.label,
      textOpts.fontSize,
      0x5f5e6c,
      false,
      0xffffff
    );
    outerLabelContainerLeft.position.set(-labelRad, 0);
    outerLabelContainerLeft.angle = -90;
    outerLabelContainerLeft.addChild(outerLabelLeft.bgSprite, outerLabelLeft.tSprite);
    outerLabelContainerLeft.interactive = true;
    outerLabelContainerLeft.buttonMode = true;
    outerLabelContainerLeft.on("mouseover", () => {
      outerLabelLeft.tSprite.tint = 0x000000;
    });
    outerLabelContainerLeft.on("mouseout", () => {
      outerLabelLeft.tSprite.tint = 0xffffff;
    });
    outerLabelContainerLeft.on("pointerdown", () => {
      this.clickHandler(appData.outerLinkLeft._id);
    });
    this.outerGfxLeft.addChild(outerLabelContainerLeft);
    this.outerGfxRight.addChild(outerLabelContainerRight);
    this.addChildAt(this.outerGfxLeft, 0);
    this.addChildAt(this.outerGfxRight, 1);
    this.castMembers.push(outerLabelContainerLeft, outerLabelContainerRight);
    Object.assign(this.aniEls, {
      rightArcs,
      leftArcs,
      ringContainer,
      centreCirc,
      outerLabelContainerLeft,
      outerLabelContainerRight,
    });
    this.introAni();
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
    /* arc.x = cx;
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
    let onClick = this.clickHandler.bind(this, pageId);
    arc.on("pointerdown", onClick);
    const { fontSize } = textOpts;
    let label = this.arcText(rad, labelTxt, fontSize, 0xffffff, flipTxt);
    label.position.y = -rad - fontSize / 2;
    arc.addChild(label);
    this.castMembers.push(arc);
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
    const { vw } = this.sceneBounds();
    let rad = Math.round(this.sceneBounds().vw / 2.2);
    let offset = Math.round(rad * 0.06);
    let px = rad * Math.cos(Math.radians(5));
    let py = rad * Math.sin(Math.radians(5));
    const gfxRight = new PIXI.Graphics();
    const gfxLeft = new PIXI.Graphics();
    gfxRight.angle = gfxLeft.angle = -90;
    gfxRight
      .lineStyle(2, 0x000000, 1)
      .moveTo(rad - offset, offset / 2)
      .lineTo(px, py)
      .arc(0, 0, rad, Math.radians(5), Math.radians(175))
      .lineTo(-rad + offset, offset / 2);
    gfxLeft
      .lineStyle(2, 0x000000, 1)
      .moveTo(-rad + offset, -offset / 2)
      .lineTo(-px, -py)
      .arc(0, 0, rad, Math.radians(185), Math.radians(355))
      .lineTo(rad - offset, -offset / 2);

    const texRight = new PIXI.Sprite(app.resources.grad_tex.texture);
    const texLeft = new PIXI.Sprite(app.resources.grad_tex.texture);
    texRight.anchor.set(0.5);
    texLeft.anchor.set(0.5);
    texRight.angle = texLeft.angle = 90;
    texRight.width = texLeft.width = vw;
    texRight.height = texLeft.height = vw;
    texRight.mask = gfxRight;
    texLeft.mask = gfxLeft;
    this.outerGfxRight.addChild(gfxRight, texRight);
    this.outerGfxLeft.addChild(gfxLeft, texLeft);
  }
  onResize(data) {
    const { stage } = this;
    if (this.resizing === true) {
      return;
    }
    if (this.animating === true) {
      bus.on("DIAGRAM_ANI_DONE", () => this.onResize());
      this.mainTl.totalProgress(1, false);
      // setTimeout(() => {
      //   this.onResize();
      // }, 1000);
      return;
    }
    // console.log("resize");
    this.resizing = true;
    this.destroyCast();
    this.removeChildren();
    stage.removeChild(this);
    this.onStage = false;
    this.initVideo().then(() => {
      this.setFontSize();
      this.positionDiagram();
      this.drawGraphics();
      this.resizing = false;
      this.enter();
    });
  }
  clickHandler(id) {
    store.commit("selectSection", id);
    store.commit("toggleModal", true);
  }

  destroyCast() {
    this.castMembers.forEach((member) => member.destroy());
    this.castMembers = [];
  }
  introAni() {
    const { centreEls, outerGfxRight, outerGfxLeft } = this;
    const { rightArcs, leftArcs, ringContainer, goldRing, video } = this.aniEls;
    const arc1 = this.aniEls.arcs[0];
    const arc2 = this.aniEls.arcs[1];
    const arc3 = this.aniEls.arcs[2];
    const arc4 = this.aniEls.arcs[3];
    const arc5 = this.aniEls.arcs[4];
    const arc6 = this.aniEls.arcs[5];
    const that = this;

    const mainTl = gsap.timeline({
      paused: true,
      onComplete: () => {
        that.animating = false;
        that.aniPlayed = true;
        bus.emit("DIAGRAM_ANI_DONE");
      },
    });
    mainTl
      .set(arc1, { pixi: { alpha: 0, scale: 0.75 } })
      .set(arc2, { pixi: { alpha: 0, scale: 0.75 } })
      .set(arc3, { pixi: { alpha: 0, scale: 0.75 } })
      .set(arc4, { pixi: { alpha: 0, scale: 0.75 } })
      .set(arc5, { pixi: { alpha: 0, scale: 0.75 } })
      .set(arc6, { pixi: { alpha: 0, scale: 0.75 } })
      .set(rightArcs, { pixi: { alpha: 0, scale: 0.75 } })
      .set(leftArcs, { pixi: { alpha: 0, scale: 0.5 } })
      .set(ringContainer, { pixi: { alpha: 0, scale: 0 } })
      .set(goldRing, { pixi: { alpha: 0, scale: 0 } })
      .set(centreEls, { pixi: { alpha: 0, scale: 0 } })
      .set(outerGfxLeft, { pixi: { alpha: 0, scale: 0.5 } })
      .set(outerGfxRight, { pixi: { alpha: 0, scale: 0.5 } })
      .set(video, { pixi: { tint: 0x000000 } });
    mainTl
      .to(this, { alpha: 1, duration: 0.1 })
      .to(centreEls, { pixi: { alpha: 1, scale: 1 }, duration: 0.8, ease: "power2.out" }, 0)
      .to(goldRing, { pixi: { alpha: 1, scale: 1 }, duration: 0.8, ease: "power2.out" }, 0)
      .to(ringContainer, { pixi: { alpha: 1, scale: 1 }, duration: 0.8, ease: "power2.out" }, 0)
      .to(video, { pixi: { tint: 0xffffff }, duration: 0.75 }, 0.75)
      .addLabel("rightArcs", 0.8)
      .to(rightArcs, { pixi: { alpha: 1, scale: 1 }, duration: 1, ease: "power2.out" }, "rightArcs")
      .to(arc1, { pixi: { alpha: 1, scale: 1 }, duration: 1, ease: "power2.out" }, "rightArcs")
      .to(arc2, { pixi: { alpha: 1, scale: 1 }, duration: 1, ease: "power2.out" }, "rightArcs+=0.2")
      .to(arc3, { pixi: { alpha: 1, scale: 1 }, duration: 1, ease: "power2.out" }, "rightArcs+=0.4")
      .to(
        outerGfxRight,
        { pixi: { alpha: 1, scale: 1 }, duration: 0.5, ease: "power2.out" },
        "rightArcs+=1"
      )
      .addLabel("leftArcs", "rightArcs+=1.2")
      .to(leftArcs, { pixi: { alpha: 1, scale: 1 }, duration: 1, ease: "power2.out" }, "leftArcs")
      .to(arc4, { pixi: { alpha: 1, scale: 1 }, duration: 1, ease: "power2.out" }, "leftArcs")
      .to(arc5, { pixi: { alpha: 1, scale: 1 }, duration: 1, ease: "power2.out" }, "leftArcs+=0.2")
      .to(arc6, { pixi: { alpha: 1, scale: 1 }, duration: 1, ease: "power2.out" }, "leftArcs+=0.4")
      .to(
        outerGfxLeft,
        { pixi: { alpha: 1, scale: 1 }, duration: 0.5, ease: "power2.out" },
        "leftArcs+=1"
      );
    this.mainTl = mainTl;
    bus.emit("DIAGRAM_READY");
  }
  enter() {
    const { stage } = this;
    if (this.onStage) {
      return;
    }
    this.onStage = true;
    this.alpha = 0;
    stage.addChild(this);
    if (this.aniPlayed === false) {
      this.animating = true;
      this.mainTl.restart();
    } else {
      gsap.to(this, { alpha: 1, duration: 0.4 });
    }
  }
}
