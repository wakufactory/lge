const QUILT_VERTEX_SHADER = `
  varying vec2 iUv;

  void main() {
    iUv = uv;
    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * modelViewPosition;
  }
`;

const QUILT_FRAGMENT_SHADER = `
  uniform sampler2D quiltTexture;
  uniform float pitch;
  uniform float tilt;
  uniform float center;
  uniform float invView; 
  uniform float flipX; 
  uniform float flipY; 
  uniform float subp; 
  uniform float tilesX;
  uniform float tilesY;
  uniform vec2 quiltViewPortion;
  varying vec2 iUv;

  vec2 texArr(vec3 uvz) {
    float z = floor(uvz.z * tilesX * tilesY);
    float x = (mod(z, tilesX) + uvz.x) / tilesX;
    float y = (floor(z / tilesX) + uvz.y) / tilesY;
    return vec2(x, y) * quiltViewPortion;
  }

  float remap(float value, float from1, float to1, float from2, float to2) {
   return (value - from1) / (to1 - from1) * (to2 - from2) + from2;
  }

  void main() {
    vec4 rgb[3];
    vec3 nuv = vec3(iUv.xy, 0.0);

    // Flip UVs if necessary
    nuv.x = (1.0 - flipX) * nuv.x + flipX * (1.0 - nuv.x);
    nuv.y = (1.0 - flipY) * nuv.y + flipY * (1.0 - nuv.y);

    for (int i = 0; i < 3; i++) {
      nuv.z = (iUv.x + float(i) * subp + iUv.y * tilt) * pitch - center;
      nuv.z = mod(nuv.z + ceil(abs(nuv.z)), 1.0);
      nuv.z = (1.0 - invView) * nuv.z + invView * (1.0 - nuv.z); 
      rgb[i] = texture2D(quiltTexture, texArr(vec3(iUv.x, iUv.y, nuv.z)));
    }

    gl_FragColor = vec4(rgb[0].r, rgb[1].g, rgb[2].b, 1);
  }
`;

export const QUILT_SHADER_PROPERTIES = {
  uniforms: {
    quiltTexture: {value: null},
    pitch: {value: 0},
    tilt: {value: 0},
    center: {value: 0},
    invView: {value: 0},
    flipX: {value: 0},
    flipY: {value: 0},
    subp: {value: 0},
    tilesX: {value: 0},
    tilesY: {value: 0},
    screenW: {value: 0},
    screenH: {value: 0},
    quiltViewPortion: {value: new THREE.Vector2(1, 1)},
  },
  vertexShader: QUILT_VERTEX_SHADER,
  fragmentShader: QUILT_FRAGMENT_SHADER,
};

