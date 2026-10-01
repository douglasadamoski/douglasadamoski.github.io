/* heart.js
 * Builds a 3D extruded heart using Two.js-style of a THREE.Shape,
 * and makes it "beat" by scaling it along the Z axis (toward the camera).
 */

AFRAME.registerComponent('heart', {
  schema: {
    color:        { type: 'color', default: '#e0244a' },
    depth:        { type: 'number', default: 0.09 },
    width:        { type: 'number', default: 0.16 },
    // Beating controls
    beatScale:    { type: 'number', default: 1.12 },  // how much it swells
    beatsPerSec:  { type: 'number', default: 1.2 }
  },

  init: function () {
    // ---- Build a heart outline as a 2D shape (parametric) ----
    const width = this.data.width;
    const heartShape = this.buildHeartShape(width);

    // ---- Extrude it into a 3D solid ----
    const extrudeSettings = {
      depth: this.data.depth,
      bevelEnabled: true,
      bevelThickness: 0.02 * this.data.width,
      bevelSize: 0.02 * this.data.width,
      bevelSegments: 4,
      curveSegments: 40
    };
    const geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    geometry.center();

    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.data.color),
      metalness: 0.25,
      roughness: 0.4,
      emissive: new THREE.Color('#7a0f22'),
      emissiveIntensity: 0.25
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.el.setObject3D('mesh', this.mesh);

    // Beat animation timing
    this.clock = new THREE.Clock();
  },

  buildHeartShape: function (width) {
    // Robust heart shape using cubic Bezier curves (classic parametric heart)
    const shape = new THREE.Shape();
    const w = width;
    // Start at bottom tip
    shape.moveTo(0, -w * 0.5);
    // Left side curve
    shape.bezierCurveTo(-w * 0.5, -w * 0.5, -w * 0.75, w * 0.2, 0, w * 0.5);
    // Right side curve (mirror)
    shape.bezierCurveTo(w * 0.75, w * 0.2, w * 0.5, -w * 0.5, 0, -w * 0.5);
    shape.closePath();
    return shape;
  },

  tick: function () {
    const t = this.clock.getElapsedTime();
    // Two quick thumps per beat cycle (double‑beat)
    const phase = t * this.data.beatsPerSec * Math.PI * 2;
    const beat = Math.abs(Math.sin(phase)); // 0 -> 1 twice per cycle

    // Swell toward the camera (positive z)
    const scaleZ = 1 + (this.data.beatScale - 1) * beat;
    // Subtle overall pulse for smoothness
    const pulse = 1 + 0.02 * Math.sin(t * this.data.beatsPerSec * Math.PI * 2);
    this.mesh.scale.set(pulse, pulse, scaleZ);
  }
});
