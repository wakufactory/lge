import 'fullscreen-polyfill';

import {getFirstDevice} from './calibration.js';

export class FullscreenHelper {
  constructor(renderer) {
    this.renderer = renderer;

    this.lkgDevice = null;
    getFirstDevice().then((d) => {
      this.lkgDevice = d;

      const startOnLkg = this.isOnLkg();
      if (startOnLkg) {
        this.renderer.render2d = false;
        this.moveWarning.style.display = 'none';
      } else {
        this.renderer.render2d = true;
        this.moveWarning.style.display = '';
      }

      requestAnimationFrame(this.update.bind(this));
    });

    this.onLkg = null;

    this.moveWarning = this.makeMoveWarning();
    document.body.appendChild(this.moveWarning);

    this.fullscreenButton = this.makeFullscreenButton();
    document.body.appendChild(this.fullscreenButton);
  }

  isOnLkg() {
    const sameResolution =
        window.screen.width == this.lkgDevice.calibration.screenW.value &&
        window.screen.height == this.lkgDevice.calibration.screenH.value;
    const sameScreenPos =
        window.screen.availLeft == this.lkgDevice.windowCoords[0];
    return sameResolution && sameScreenPos;
  }

  update() {
    requestAnimationFrame(this.update.bind(this));

    const nowOnLkg = this.isOnLkg();
    if (nowOnLkg && !this.onLkg) {
      // just moved to lkg
      this.renderer.render2d = false;
      this.moveWarning.style.display = 'none';
    } else if (!nowOnLkg && this.onLkg) {
      // just moved OFF lkg
      this.renderer.render2d = true;
      this.moveWarning.style.display = '';
    }
    this.onLkg = nowOnLkg;

    if (this.onLkg && !document.fullscreen) {
      if (document.hasFocus()) {
        this.fullscreenButton.innerText = 'click to go fullscreen';
      } else {
        this.fullscreenButton.innerText = 'click to focus window';
      }
      this.fullscreenButton.style.display = '';
    } else {
      this.fullscreenButton.style.display = 'none';
    }
  }

  makeMoveWarning() {
    const moveWarning = document.createElement('div');
    moveWarning.innerText = 'drag this window to the Looking Glass';
    moveWarning.style.cssText = `
      background: white;
      border-radius: 8px;
      bottom: 0px;
      display: none;
      font-family: sans-serif;
      font-size: 6em;
      left: 0px;
      margin: 16px;
      opacity: 0.5;
      padding: 8px;
      position: absolute;
      z-index: ${Number.MAX_SAFE_INTEGER};
    `;
    return moveWarning;
  }

  makeFullscreenButton() {
    const fullscreenButton = document.createElement('div');
    fullscreenButton.innerText = 'go fullscreen';
    fullscreenButton.style.cssText = `
      background: white;
      border-radius: 8px;
      bottom: 0px;
      display: none;
      font-family: sans-serif;
      font-size: 6em;
      font-weight: bold;
      left: 0px;
      margin: 16px;
      opacity: 0.75;
      padding: 8px;
      pointer-events: none;
      position: absolute;
      z-index: ${Number.MAX_SAFE_INTEGER};
    `;
    window.addEventListener('click', () => {
      this.renderer.domElement.requestFullscreen();
    });
    return fullscreenButton;
  }
}
