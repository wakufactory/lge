import * as Calibration from './calibration.js';
import {FullscreenHelper} from './fullscreen.js';
import QuiltRenderer from './quiltrenderer.js';

export class Renderer {
  constructor(opt_options) {
    this.enforceMandatoryDocumentStyle();

    let options = opt_options || {};

    this.quiltResolution = options.quiltResolution || 4096;
    this.tileCount = options.tileCount || new THREE.Vector2(5, 9);

    this.render2d = options.render2d || false;
    this.renderQuilt = options.renderQuilt || false;

    this.fullscreenHelper = null;
    if (!options.disableFullscreenUi) {
      this.fullscreenHelper = new FullscreenHelper(this);
    }

    this.webglRenderer = new THREE.WebGLRenderer();

    this.domElement = this.webglRenderer.domElement;

    this.quiltRenderTarget = new THREE.WebGLRenderTarget(
        this.quiltResolution, this.quiltResolution, {format: THREE.RGBFormat});

    this.quiltRenderer = new QuiltRenderer(this.tileCount, this.webglRenderer);
    this.quiltRenderer.setQuiltTexture(this.quiltRenderTarget.texture);

    if (!options.quiltResolution) {
      Calibration.getIdealQuiltResolution().then((res) => {
        this.quiltResolution = res;
      });
    }

    if (!options.tileCount) {
      Calibration.getIdealQuiltTileCount().then((count) => {
        this.tileCount.copy(count);
      });
    }

    this.debug2dCamera = new THREE.PerspectiveCamera();
    Calibration.getIdealFov().then((fov) => {
      this.debug2dCamera.fov = fov;
      this.debug2dCamera.updateProjectionMatrix();
    });
  }

  enforceMandatoryDocumentStyle() {
    document.body.style.margin = '0px';
    document.body.style.overflow = 'hidden';
  }

  render(scene, camera) {
    this.enforceMandatoryDocumentStyle();

    if (this.render2d) {
      this.debug2dCamera.position.copy(camera.position);
      this.debug2dCamera.rotation.copy(camera.rotation);

      const aspect = window.innerWidth / window.innerHeight;
      if (aspect != this.debug2dCamera.aspect) {
        this.debug2dCamera.aspect = aspect;
        this.debug2dCamera.updateProjectionMatrix();
      }

      this.webglRenderer.domElement.style.top =
          this.webglRenderer.domElement.style.left = '0px';
      this.webglRenderer.setSize(window.innerWidth, window.innerHeight);
      this.webglRenderer.render(scene, this.debug2dCamera);
    } else if (this.renderQuilt) {
      camera.update(this.quiltResolution, this.tileCount);

      const minWindowDimension =
          Math.min(window.innerWidth, window.innerHeight);
      this.webglRenderer.domElement.style.width =
          this.webglRenderer.domElement.style.height =
              `${minWindowDimension}px`;
      this.webglRenderer.domElement.style.top =
          this.webglRenderer.domElement.style.left = '0px';

      this.webglRenderer.setRenderTarget(null);
      this.webglRenderer.setSize(
          this.quiltResolution, this.quiltResolution, false);
      this.webglRenderer.render(scene, camera);
    } else {
      this.quiltRenderTarget.setSize(
          this.quiltResolution, this.quiltResolution);

      camera.update(this.quiltResolution, this.tileCount);
      this.webglRenderer.setRenderTarget(this.quiltRenderTarget);
      this.webglRenderer.setSize(
          this.quiltResolution, this.quiltResolution, false);
      this.webglRenderer.render(scene, camera);

      this.webglRenderer.setRenderTarget(null);
      this.quiltRenderer.update(this.quiltResolution, this.tileCount);
      this.quiltRenderer.render();
    }
  }
}
