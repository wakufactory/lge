let _scene 
// message from main window
function msg(m) {
	console.log(m)
	if(m.cmd) {
		switch(m.cmd) {
			case "getparam":
				return settings.param 
				break ;
			case "render":
				if(m.param.mode==0) _scene.pause()
				if(m.param.mode==1) _scene.start()
				if(m.param.mode==2) {
					_scene.oneframe(m.param.time,(time)=>{
						if(m.param.cb) m.param.cb()
					})
				}
				break
			case "getcanvas":
				return document.querySelector("canvas")
				break ;
			case "setRender":
				_scene.renderer.tileCount = new THREE.Vector2(m.param.tileX,m.param.tileY)
				_scene.renderer.quiltResolution = m.param.res 
				_scene.renderer.disableFullscreenUi = false
				_scene.renderer.renderQuilt = (m.param.mode==1)
				_scene.oneframe(null)
				break 
		}
	} else if(m.param) {
		_scene.setParam(m.param)
		_scene.oneframe(null)
	}
}
window.addEventListener("load",() =>{
	_scene = new Scene()
	_scene.oneframe(0)
	if(window.opener) window.opener.childloaded(settings)
	else {
		_scene.setParam(settings.param.reduce((a,o)=>{a[o.name]=o.value;return a},{}))
		_scene.start()
	}
})

// scene base class
class SceneBase {
constructor() {
	this.stree = {}
	this.renderer = this.mkRender([9,5],3000,false) 
	this.camera = this.mkCamera()
	this.scene  = this.mkScene()
	document.body.appendChild(this.renderer.domElement)

	this.stree.renderer = this.renderer
	this.stree.camera = this.camera 
	this.rf = true 
	this.ctime = 0
	console.log(this.stree) 
}
complete() {
	this.oneframe(this.ctime)
}
start() {
	this.rf = true 
	const update = (time) => {
		this.ctime = time 
	  if(this.rf) requestAnimationFrame(update);
		this.setframe(time)
	  try {
		   this.renderer.render(this.scene, this.camera);
	  } catch(err) {
	    console.log(err)
	  }
	}
	requestAnimationFrame(update);	
}
pause() {
	this.rf = false 
}
oneframe(time,cb) {
	if(time===null) time = this.ctime
	else this.ctime = time 
	this.setframe(time)
	try {
		this.renderer.render(this.scene, this.camera);
	} catch(err) {
	    console.log(err)
	}
	if(cb) cb(time)
}
mkRender(tile=[9,5],res=3000,quilt=false) {
		let renderer 
		renderer = new HoloPlay.Renderer({
		  tileCount:new THREE.Vector2(tile[0],tile[1]),
		  quiltResolution:res,
			disableFullscreenUi: false,
			renderQuilt: quilt,
			webGLOptions:{preserveDrawingBuffer:quilt}
		  });
		return renderer 
	}
mkCamera() {
		const camera = new HoloPlay.Camera()
		return camera 
	}
}