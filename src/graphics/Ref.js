/**
 * Archived PIXI bits may need later
 */

  // Using sprites
  createArc() {
    const { vw,  cx, cy } = this.sceneBounds();
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

/**
 * https://www.pixiplayground.com/#/edit/EOxtz6zy7rsr2ryzzPNBC
 * pixel perfect interaction for sprites
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
    // console.log(baseTex);
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
