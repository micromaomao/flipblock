let scene = new THREE.Scene()

function round (float) {
  return Math.round(float * 1000) / 1000
}

class FlipBlock {
  constructor (scene) {
    this._scene = scene
    this._groundBlocks = []
    this._maxX = 40
    this._maxY = 30
    this._groundDepth = 0.05
    for (let i = 0; i <= this.maxX; i ++) {
      this._groundBlocks[i] = []
      for (let j = 0; j <= this.maxY; j ++) {
        this._groundBlocks[i][j] = null
      }
    }
    this._ground = new THREE.Object3D()
    scene.add(this._ground)

    this._animationTime = 100

    this._groundMaterial = new THREE.MeshLambertMaterial({color: 0xeeeeee})
    this._groundTargetMaterial = new THREE.MeshLambertMaterial({color: 0x4caf50})
    this._groundGeo = new THREE.BoxGeometry(0.95, 0.95, this.groundDepth)

    this.groundDrawRect(0, 0, 5, 5)
    this.groundDrawRect(3, 3, 5, 5)
    this.groundDrawRect(6, 6, 5, 5)
    this.groundEraseRect(5, 5, 2, 2)
    this.clearGroundBlock(2, 2)
    this.buildGroundTarget(10, 10)

    this._boxDim = {w: 1, h: 1, d: 2}
    let boxDim = this._boxDim
    this._boxFaceVect = {wh: new THREE.Vector3(0, 0, -boxDim.d / 2), wd: new THREE.Vector3(0, -boxDim.h / 2, 0), hd: new THREE.Vector3(-boxDim.w, 0, 0)}

    this._boxMaterial = new THREE.MeshPhongMaterial({color: 0x795548})
    this._boxContainer = new THREE.Object3D()
    this._box = new THREE.Mesh(new THREE.BoxGeometry(boxDim.w, boxDim.h, boxDim.d), this._boxMaterial)
    this._boxContainer.add(this._box)
    this._initialBoxPos = new THREE.Vector3(0.5, 0.5, this._groundDepth / 2 + boxDim.d / 2)
    this._boxContainer.position.copy(this._initialBoxPos)
    scene.add(this._boxContainer)

    this._boxLight = new THREE.PointLight(0xffffff, 0.3, 30)
    this._boxLight.position.set(0.5, 0.5, boxDim.d + 2)
    scene.add(this._boxLight)
  }
  initBox () {
    if (this._transforming) throw new Error('Can not init box while transforming.')
    this._transforming = true
    this._boxContainer.rotation.set(0, 0, 0)
    this._boxContainer.position.copy(this._initialBoxPos)
    this.animation(3, this._boxContainer.position.z, 200, () => {
      this._transforming = false
    }, v => {
      this._boxContainer.position.setZ(v)
    })
  }
  get maxX () {
    return this._maxX
  }
  get maxY () {
    return this._maxY
  }
  get scene () {
    return this._scene
  }
  get groundDepth () {
    return this._groundDepth
  }
  groundDrawRect (x, y, w, h) {
    for (let i = x; i < x + w; i ++) {
      for (let j = y; j < y + h; j ++) {
        this.buildGroundBlock(i, j)
      }
    }
  }
  groundEraseRect (x, y, w, h) {
    for (let i = x; i < x + w; i ++) {
      for (let j = y; j < y + h; j ++) {
        this.clearGroundBlock(i, j)
      }
    }
  }
  buildGroundBlock (x, y) {
    if (x >= this.maxX || y >= this.maxY) {
      throw new Error('coordinate out of range')
    }
    if (this._groundBlocks[x][y]) {
      return
    }
    let geo = this._groundGeo
    let box = new THREE.Mesh(geo, this._groundMaterial)
    box.position.set(x + 0.5, y + 0.5, 0)
    this._groundBlocks[x][y] = {geometry: geo, mesh: box}
    this._ground.add(box)
  }
  buildGroundTarget (x, y) {
    if (x >= this.maxX || y >= this.maxY) {
      throw new Error('coordinate out of range')
    }
    if (this._groundBlocks[x][y]) {
      this.clearGroundBlock(x, y)
      this.buildGroundTarget(x, y)
      return
    }
    let geo = this._groundGeo
    let box = new THREE.Mesh(geo, this._groundTargetMaterial)
    box.position.set(x + 0.5, y + 0.5, 0)
    this._groundBlocks[x][y] = {geometry: geo, mesh: box, target: true}
    this._ground.add(box)
  }
  clearGroundBlock (x, y) {
    if (x >= this.maxX || y >= this.maxY) {
      throw new Error('coordinate out of range')
    }
    if (!this._groundBlocks[x][y]) {
      return
    }
    let {mesh: box} = this._groundBlocks[x][y]
    this._ground.remove(box)
    this._groundBlocks[x][y] = 0
  }
  startBoxTransform (centerX, centerY, centerZ) {
    if (this._transforming) {
      throw new Error('There is another transform currently going on.')
    }
    this._transforming = true
    let rot = this._box.getWorldRotation()
    this._box.rotation.copy(rot)
    this._boxContainer.rotation.set(0, 0, 0)
    this._box.position.add(new THREE.Vector3(-centerX, -centerY, -centerZ))
    this._boxContainer.position.add(new THREE.Vector3(centerX, centerY, centerZ))
    this._boxContainer.updateMatrixWorld()
  }
  startBoxTransformFromWorldCord(vect) {
    let nVect = new THREE.Vector3()
    nVect.copy(vect)
    nVect.sub(this._boxContainer.position)
    this.startBoxTransform(round(nVect.x), round(nVect.y), round(nVect.z))
  }
  endBoxTransform () {
    if (!this._transforming) {
      throw new Error('There are no transform going on.')
    }
    this._boxContainer.updateMatrixWorld()
    let pos = this._box.getWorldPosition()
    let rot = this._box.getWorldRotation()
    this._boxContainer.position.copy(pos)
    this._boxContainer.rotation.copy(rot)
    this._box.position.set(0, 0, 0)
    this._box.rotation.set(0, 0, 0)
    this._boxContainer.updateMatrixWorld()
    this._transforming = false
  }
  getFaceTldr () {
    let tl // Top-left
    let dr // Down-right
    let boxD = this._boxDim
    // Face: {wh, wd, hd}

    // Get tl and dr in object space.
    if (this.ifFaceDown('wh')) {
      tl = new THREE.Vector3(-boxD.w / 2, -boxD.h / 2, 0)
      dr = new THREE.Vector3(boxD.w / 2, boxD.h / 2, 0)
    } else if (this.ifFaceDown('wd')) {
      tl = new THREE.Vector3(-boxD.w / 2, 0, -boxD.d / 2)
      dr = new THREE.Vector3(boxD.w / 2, 0, boxD.d / 2)
    } else if (this.ifFaceDown('hd')) {
      tl = new THREE.Vector3(0, -boxD.h / 2, -boxD.d / 2)
      dr = new THREE.Vector3(0, boxD.h / 2, boxD.d / 2)
    } else {
      throw new Error('Something goes wrong')
    }
    this._box.localToWorld(tl)
    this._box.localToWorld(dr)

    if (tl.x > dr.x) {
      let tmp = tl
      tl = dr
      dr = tmp
    }
    if (tl.y > dr.y) {
      let tmp = tl.y
      tl.setY(dr.y)
      dr.setY(tmp)
    }
    tl.x = round(tl.x)
    dr.x = round(dr.x)
    tl.y = round(tl.y)
    dr.y = round(dr.y)
    tl.z = this._groundDepth / 2
    dr.z = this._groundDepth / 2
    return {tl, dr}
  }
  getDownFaceCoords () {
    let {tl, dr} = this.getFaceTldr()
    let pts = []
    for (let i = tl.x; i < dr.x; i ++) {
      for (let j = tl.y; j < dr.y; j ++) {
        pts.push([i, j])
      }
    }
    return pts
  }
  ifFaceDown (face) {
    let fv = this._boxFaceVect[face]
    if (!fv) {
      throw new Error(`Face ${face} do not exist.`)
    }
    let nVet = this.rotateFaceVector(fv)
    return (round(nVet.x) === 0 && round(nVet.y) === 0)
  }
  rotateFaceVector (vect) {
    if (this._transforming) {
      throw new Error('You must end the transformation before calling this.')
    }
    let nv = new THREE.Vector3()
    nv.copy(vect)
    nv.applyEuler(this._boxContainer.rotation)
    return nv
  }

  animation (start, end, time, finish, value) {
    let startTime = Date.now()
    let cts = setInterval(() => {
      let prog = Date.now() - startTime
      if (prog >= time) {
        value(end)
        clearInterval(cts)
        finish()
      } else {
        let nv = start + (end - start) * (prog / time)
        value(nv)
      }
    })
  }
  turnLeft () {
    if (this._transforming) return
    let {tl} = this.getFaceTldr()
    this.startBoxTransformFromWorldCord(tl)
    let nRotY = this._boxContainer.rotation.y - Math.PI / 2
    this.animation(this._boxContainer.rotation.y, nRotY, this._animationTime, () => {
      this.endBoxTransform()
      this.postTurn()
    }, v => {
      this._boxContainer.rotation.y = v
    })
  }
  turnRight () {
    if (this._transforming) return
    let {dr} = this.getFaceTldr()
    this.startBoxTransformFromWorldCord(dr)
    let nRotY = this._boxContainer.rotation.y + Math.PI / 2
    this.animation(this._boxContainer.rotation.y, nRotY, this._animationTime, () => {
      this.endBoxTransform()
      this.postTurn()
    }, v => {
      this._boxContainer.rotation.y = v
    })
  }
  turnUp () {
    if (this._transforming) return
    let {dr} = this.getFaceTldr()
    this.startBoxTransformFromWorldCord(dr)
    let nRotX = this._boxContainer.rotation.x - Math.PI / 2
    this.animation(this._boxContainer.rotation.x, nRotX, this._animationTime, () => {
      this.endBoxTransform()
      this.postTurn()
    }, v => {
      this._boxContainer.rotation.x = v
    })
  }
  turnDown () {
    if (this._transforming) return
    let {tl} = this.getFaceTldr()
    this.startBoxTransformFromWorldCord(tl)
    let nRotX = this._boxContainer.rotation.x + Math.PI / 2
    this.animation(this._boxContainer.rotation.x, nRotX, this._animationTime, () => {
      this.endBoxTransform()
      this.postTurn()
    }, v => {
      this._boxContainer.rotation.x = v
    })
  }

  postTurn () {
    let faces = this.getDownFaceCoords()
    let emptySpace = 0
    let ret = false
    faces.forEach(co => {
      if (ret) return
      let [x, y] = co
      if (x < 0 || y < 0) {
        this.fail()
        ret = true
        return
      }
      if (this._groundBlocks[x][y] === null) {
        this.fail()
        ret = true
      } else if (this._groundBlocks[x][y] === 0) {
        emptySpace ++
      }
    })
    if (ret) return
    if (emptySpace === faces.length) {
      this.fail()
      return
    }
    if (faces.length === 1) {
      let [x, y] = faces[0]
      let gb = this._groundBlocks[x][y]
      if (gb && gb.target) {
        this.success()
      }
    }
  }
  fail () {
    this.initBox()
  }
  success () {}
}

let fb = new FlipBlock(scene)

let camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
let renderer = new THREE.WebGLRenderer({
  antialias: true
})

function handleResize () {
  let wid = window.innerWidth
  let hig = window.innerHeight
  camera.aspect = wid / hig
  camera.updateProjectionMatrix()
  renderer.setSize(wid, hig)
}

handleResize()
window.addEventListener('resize', handleResize)

function doRender () {
  requestAnimationFrame(doRender)
  renderer.render(scene, camera)
}

Object.assign(document.body.style, {
  margin: '0',
  padding: '0',
  overflow: 'hidden'
})
document.body.appendChild(renderer.domElement)

camera.position.set(2.5, -5, 6)
camera.rotation.set(Math.PI / 3, Math.PI / -12, 0)

let light = new THREE.HemisphereLight(0xffffff, 0x222222, 1.5)
scene.add(light)

doRender()

window.addEventListener('keydown', evt => {
  console.log(evt.key)
  if (evt.key === 'ArrowLeft') {
    fb.turnLeft()
  }
  if (evt.key === 'ArrowRight') {
    fb.turnRight()
  }
  if (evt.key === 'ArrowUp') {
    fb.turnUp()
  }
  if (evt.key === 'ArrowDown') {
    fb.turnDown()
  }
})

// ;(() => {
//   let x = new THREE.Object3D()
//   x.position.set(0, 0, 0)
//   let y = new THREE.Object3D()
//   y.position.set(0, 5, 0)
//   x.add(y)
//   scene.add(x)
//   x.rotateZ(Math.PI / 2)
//   x.updateMatrixWorld()
//   y.updateMatrixWorld()
//   let pos = y.getWorldPosition()
//   let rot = y.getWorldRotation()
//   console.info(pos)
//   console.info(rot)
// })()
