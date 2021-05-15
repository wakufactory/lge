import * as HoloPlayCore from 'holoplay-core';

export const DEFAULT_CALIBRATION = {
  'configVersion': '1.0',
  'serial': '00000',
  'pitch': {'value': 47.556365966796878},
  'slope': {'value': -5.488804340362549},
  'center': {'value': 0.15815216302871705},
  'viewCone': {'value': 40.0},
  'invView': {'value': 1.0},
  'verticalAngle': {'value': 0.0},
  'DPI': {'value': 338.0},
  'screenW': {'value': 2560.0},
  'screenH': {'value': 1600.0},
  'flipImageX': {'value': 0.0},
  'flipImageY': {'value': 0.0},
  'flipSubp': {'value': 0.0}
};

function checkDriverInstall() {
  if (confirm(
          'HoloPlayService not detected! Click OK to download. If you have it already installed, please make sure it is running.')) {
    window.location.href = 'http://look.glass/holoplayservice';
  }
}

let cachedPromise = null;

function getDevices() {
  if (!cachedPromise) {
    cachedPromise = new Promise((resolve, reject) => {
      new HoloPlayCore.Client(
          (data) => {
            if (data.devices.length == 0) {
              alert(
                  'No Looking Glass detected. Please make sure your Looking Glass is plugged in.');
            }
            resolve(data.devices);
          },
          (err) => {
            console.error('error loading calibration', err);
            checkDriverInstall();
            reject(err);
          },
          console.log);
    });
  }
  return cachedPromise;
}

export function getFirstDevice() {
  return getDevices().then((devices) => {
    if (devices.length == 0) {
      throw new Error('no devices');
    }
    return devices[0];
  });
}

export function getCalibration() {
  return getFirstDevice()
      .then((d) => {
        return d.calibration;
      })
      .catch((err) => {
        console.error('no devices connected. using default calibration.');
        return DEFAULT_CALIBRATION;
      });
}

const IDEAL_PROPERTIES = {
  'standard': {
    'quiltResolution': 4096,
    'tileCount': new THREE.Vector2(5, 9),
    'viewCone': 35,
    'fov': 12.5,
  },
  'large': {
    'quiltResolution': 4096,
    'tileCount': new THREE.Vector2(5, 9),
    'viewCone': 35,
    'fov': 12.5,
  },
  'pro': {
    'quiltResolution': 4096,
    'tileCount': new THREE.Vector2(5, 9),
    'viewCone': 35,
    'fov': 12.5,
  },
  '8k': {
    'quiltResolution': 8192,
    'tileCount': new THREE.Vector2(5, 9),
    'viewCone': 35,
    'fov': 12.5,
  },
  'default': {
    'quiltResolution': 2048,
    'tileCount': new THREE.Vector2(4, 8),
    'viewCone': 35,
    'fov': 12.5,
  },
};

function getIdealProperty(propName) {
  return getFirstDevice()
      .then((d) => {
        return IDEAL_PROPERTIES[d.hardwareVersion][propName];
      })
      .catch((err) => {
        return IDEAL_PROPERTIES['default'][propName];
      });
}

export function getIdealQuiltResolution() {
  return getIdealProperty('quiltResolution');
}

export function getIdealQuiltTileCount() {
  return getIdealProperty('tileCount');
}

export function getIdealViewCone() {
  return getIdealProperty('viewCone');
}

export function getIdealFov() {
  return getIdealProperty('fov');
}
