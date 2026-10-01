/* heart.js — Beating Heart AR v0.2
 * Builds a 10X 3D heart with proper anatomical curves and
 * a realistic physiological "Lub-Dub" cardiac cycle animation.
 */

AFRAME.registerComponent('heart', {
  schema: {
    color:        { type: 'color', default: '#e0244a' },
    depth:        { type: 'number', default: 0.72 },   // 10X depth
    width:        { type: 'number', default: 1.60 },   // 10X width (60% larger than Hiro marker)
    beatScale:    { type: 'number', default: 1.28 },   // Swell amplitude
    beatsPerSec:  { type: 'number', default: 1.2 }     // ~72 BPM
  },

  init: function () {
    const width = this.data.width;
    const heartShape = this.buildHeartShape(width);

    const extrudeSettings = {
      depth: this.data.depth,
      bevelEnabled: true,
      bevelThickness: 0.08 * width,
      bevelSize: 0.05 * width,
      bevelSegments: 4,
      curveSegments: 40
    };
    const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    geometry.center();

    this.material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.data.color),
      metalness: 0.20,
      roughness: 0.35,
      emissive: new THREE.Color('#7a0f22'),
      emissiveIntensity: 0.25
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.castShadow = true;
    this.el.setObject3D('mesh', this.mesh);

    this.clock = new THREE.Clock();
  },

  buildHeartShape: function (width) {
    // Authentic 4-curve cubic Bezier heart shape with top cleft, full lobes, and apex
    const shape = new THREE.Shape();
    const w = width;
    const h = width * 0.90;

    // Start at top center cleft
    shape.moveTo(0, 0.22 * h);

    // Left atrium and superior lobe apex
    shape.bezierCurveTo(
      -0.15 * w, 0.54 * h,
      -0.54 * w, 0.52 * h,
      -0.52 * w, 0.15 * h
    );

    // Left ventricular margin down to apex
    shape.bezierCurveTo(
      -0.50 * w, -0.15 * h,
      -0.24 * w, -0.38 * h,
      0,         -0.52 * h
    );

    // Right ventricular margin curving up
    shape.bezierCurveTo(
      0.24 * w, -0.38 * h,
      0.50 * w, -0.15 * h,
      0.52 * w,  0.15 * h
    );

    // Right superior lobe back into the top center cleft
    shape.bezierCurveTo(
      0.54 * w, 0.52 * h,
      0.15 * w, 0.54 * h,
      0,        0.22 * h
    );

    shape.closePath();
    return shape;
  },

  tick: function () {
    const t = this.clock.getElapsedTime();
    const cycle = 1.0 / this.data.beatsPerSec; // e.g. 0.833s
    const tau = (t % cycle) / cycle;           // 0.0 to 1.0 phase

    // Physiological cardiac phases (Wiggers diagram model):
    // 1. S1 Lub (ventricular systole): 0.00 -> 0.20 of cycle
    // 2. S2 Dub (semilunar closure):   0.24 -> 0.44 of cycle
    // 3. Diastole (rest / filling):    0.44 -> 1.00 of cycle

    let lub = 0.0;
    if (tau < 0.20) {
      const p = tau / 0.20;
      lub = Math.pow(Math.sin(p * Math.PI), 2);
    }

    let dub = 0.0;
    if (tau >= 0.24 && tau < 0.44) {
      const p = (tau - 0.24) / 0.20;
      dub = Math.pow(Math.sin(p * Math.PI), 2) * 0.45;
    }

    // 3D volumetric pump
    const scaleFactor = this.data.beatScale - 1.0;
    const sx = 1.0 + scaleFactor * 0.65 * (lub + dub);
    const sy = 1.0 + scaleFactor * 0.35 * (lub + dub);
    const sz = 1.0 + scaleFactor * 1.00 * (lub + dub);

    // Gentle breathing idle during diastole
    const idle = 0.015 * Math.sin(t * 1.5);
    this.mesh.scale.set(sx + idle, sy - 0.5 * idle, sz + idle);

    // Apical muscular twist during systole
    this.mesh.rotation.y = 0.08 * (lub - 0.4 * dub);

    // Hemodynamic arterial flush (emissive pulse)
    const flush = Math.max(lub, dub * 1.2);
    this.material.emissiveIntensity = 0.22 + 0.65 * flush;
  }
});
