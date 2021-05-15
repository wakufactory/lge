import * as Calibration from './calibration.js';

export class Camera extends THREE.ArrayCamera {
  constructor() {
    super();

    this.tileCount = new THREE.Vector2();
    this.target = new THREE.Vector3(0, 0, 0);
    this.position.set(0, 0, 1);

    // just some defaults. we'll get them from calibration in a sec.
    this.fov = 12.5;
    this.aspect = 2560 / 1600;
    this.viewCone = 35;

    Calibration.getIdealViewCone().then((viewCone) => {
      this.viewCone = viewCone;
    });

    Calibration.getIdealFov().then((fov) => {
      this.fov = fov;
      this.cameras.forEach((c) => {
        c.fov = this.fov;
        c.updateProjectionMatrix();
      });
    });

    Calibration.getCalibration().then((calibration) => {
      this.aspect = calibration.screenW.value / calibration.screenH.value;
      this.cameras.forEach((c) => {
        c.aspect = this.aspect;
        c.updateProjectionMatrix();
      });
    });
  }

  update(quiltResolution, tileCount) {
    // rebuild camera array if the camera count changes
    if (this.tileCount.x != tileCount.x || this.tileCount.y != tileCount.y) {
      this.cameras = [];
      for (let i = 0; i < tileCount.x * tileCount.y; i++) {
        const subcamera = new THREE.PerspectiveCamera(this.fov, this.aspect);
        subcamera.viewport = new THREE.Vector4();
        this.cameras.push(subcamera);
      }
      this.tileCount.copy(tileCount);
    }

    const tileSize = new THREE.Vector2(
        Math.floor(quiltResolution / tileCount.x),
        Math.floor(quiltResolution / tileCount.y));

    for (let i = 0; i < this.cameras.length; i++) {
      const subcamera = this.cameras[i];
      subcamera.rotation.copy(this.rotation);

      const tileGridPos =
          new THREE.Vector2(i % tileCount.x, Math.floor(i / tileCount.x));
      subcamera.viewport.set(
          tileGridPos.x * tileSize.x, tileGridPos.y * tileSize.y, tileSize.x,
          tileSize.y);

      const distanceToTarget = this.position.distanceTo(this.target);
      const angleToThisCamera = THREE.Math.degToRad(THREE.Math.lerp(
          -this.viewCone / 2, this.viewCone / 2,
          i / (this.cameras.length - 1)));
      const offsetAlongBaseline =
          distanceToTarget * Math.tan(angleToThisCamera);

      subcamera.position.copy(
          this.localToWorld(new THREE.Vector3(offsetAlongBaseline, 0, 0)));
      subcamera.updateMatrixWorld();

      subcamera.projectionMatrix.elements[8] = -2 * offsetAlongBaseline /
          (2 * distanceToTarget *
           Math.tan(0.5 * THREE.Math.degToRad(subcamera.fov)) *
           subcamera.aspect);
    }
  }

  lookAt(targetPosition) {
    super.lookAt(targetPosition);
    this.target.copy(targetPosition);
  }
}
