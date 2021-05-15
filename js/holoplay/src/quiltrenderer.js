import {getCalibration} from './calibration.js';
import {QUILT_SHADER_PROPERTIES} from './shaders.js';

export default class QuiltRenderer {
  constructor(tileCount, opt_renderer) {
    getCalibration().then((calibration) => {
      this.calibrationData = calibration;
      this.updateCalibration();
    });

    this.tileCount = tileCount;

    this.scene = new THREE.Scene();

    const quiltPlaneGeometry = new THREE.PlaneGeometry(1, 1);
    const quiltPlaneMaterial =
        new THREE.ShaderMaterial(QUILT_SHADER_PROPERTIES);
    this.quiltPlane = new THREE.Mesh(quiltPlaneGeometry, quiltPlaneMaterial);
    this.scene.add(this.quiltPlane);

    this.camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0);
    this.renderer = opt_renderer || new THREE.WebGLRenderer();

    this.renderSize = new THREE.Vector2(window.innerWidth, window.innerHeight);

    this.domElement = this.renderer.domElement;
    this.domElement.style.position = 'absolute';
  }

  render() {
    this.renderer.setSize(this.renderSize.x, this.renderSize.y);
    this.negateWindowZoomAndOffset();
    this.renderer.render(this.scene, this.camera);
  }

  update(quiltResolution, tileCount) {
    this.tileCount.copy(tileCount);
    this.quiltPlane.material.uniforms.tilesX.value = this.tileCount.x;
    this.quiltPlane.material.uniforms.tilesY.value = this.tileCount.y;

    this.quiltPlane.material.uniforms.quiltViewPortion.value.set(
        (Math.floor(quiltResolution / this.tileCount.x) * this.tileCount.x) /
            quiltResolution,
        (Math.floor(quiltResolution / this.tileCount.y) * this.tileCount.y) /
            quiltResolution);
  }

  negateWindowZoomAndOffset() {
    const windowZoom =
        window.outerWidth / document.body.getBoundingClientRect().width;
    const browserToolbarHeight = window.outerHeight - window.innerHeight;
    this.domElement.style.width = `${this.domElement.width / windowZoom}px`;
    this.domElement.style.height = `${this.domElement.height / windowZoom}px`;
    this.domElement.style.left =
        `${(window.screen.availLeft - window.screenLeft) / windowZoom}px`;
    this.domElement.style.top =
        `${- (window.screenTop + browserToolbarHeight) / windowZoom}px`;
  }

  setQuiltImageURL(url) {
    const quiltImage = new Image();
    quiltImage.src = url;
    this.setQuiltImage(quiltImage);
  }

  setQuiltImage(quiltImage) {
    const imageTexture = new THREE.Texture();
    imageTexture.image = quiltImage;
    imageTexture.minFilter = THREE.NearestFilter;
    imageTexture.magFilter = THREE.NearestFilter;

    this.setQuiltTexture(imageTexture);

    // Update the texture when the image loads.
    quiltImage.addEventListener('load', () => {
      imageTexture.needsUpdate = true;
      this.render();
    });

    if (quiltImage.complete) {
      // Force a load event for an already downloaded file.
      quiltImage.load();
    }
  }

  setQuiltTexture(quiltTexture) {
    this.quiltPlane.material.uniforms.quiltTexture.value = quiltTexture;
  }

  updateCalibration() {
    if (!this.calibrationData) {
      return;
    }

    this.renderSize.set(
        this.calibrationData.screenW.value, this.calibrationData.screenH.value);

    const quiltMaterial = this.quiltPlane.material;

    const screenInches =
        this.calibrationData.screenW.value / this.calibrationData.DPI.value;
    let newPitch = this.calibrationData.pitch.value * screenInches;

    // account for tilt in measuring pitch horizontally
    newPitch *= Math.cos(Math.atan(1.0 / this.calibrationData.slope.value));
    quiltMaterial.uniforms.pitch.value = newPitch;

    // tilt
    let newTilt = this.calibrationData.screenH.value /
        (this.calibrationData.screenW.value * this.calibrationData.slope.value);
    if (this.calibrationData.flipImageX.value == 1) {
      newTilt *= -1;
    }
    quiltMaterial.uniforms.tilt.value = newTilt;

    // center
    // I need the relationship between the amount of pixels I have moved over to
    // the amount of lenticulars I have jumped
    // ie how many pixels are there to a lenticular?
    quiltMaterial.uniforms.center.value = this.calibrationData.center.value;

    // should we invert?
    quiltMaterial.uniforms.invView.value = this.calibrationData.invView.value;

    // Should we flip it for peppers?
    quiltMaterial.uniforms.flipX.value = this.calibrationData.flipImageX.value;
    quiltMaterial.uniforms.flipY.value = this.calibrationData.flipImageY.value;

    quiltMaterial.uniforms.subp.value =
        1 / (this.calibrationData.screenW.value * 3);

    // tiles
    quiltMaterial.uniforms.tilesX.value = this.tileCount.x;
    quiltMaterial.uniforms.tilesY.value = this.tileCount.y;
  };
}

