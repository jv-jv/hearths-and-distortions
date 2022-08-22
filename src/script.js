/*

Disclaimer:
There's a lot of spaghetti code down here. 
This is just a bit of fun

*/

import * as THREE from "three"
import gsap from "gsap"

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js"
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js"

import vertexPlaneShader from "./shaders/imageDistortion/vertex.glsl"
import fragmentPortalShader from "./shaders/portal/fragment.glsl"
import vertexPortalShader from "./shaders/portal/vertex.glsl"
import fragmentPlaneShader from "./shaders/imageDistortion/fragment.glsl"

import "./style.css"

// Canvas
const canvas = document.querySelector("canvas.webgl")

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}
const scene = new THREE.Scene()

// Loaders
const textureLoader = new THREE.TextureLoader()
const pictureFaceTexture = textureLoader.load("/assets/2.jpg")

const particleTexture = textureLoader.load("/assets/particles/symbol_01.png")
const fontLoader = new FontLoader()

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.x = 0
camera.position.y = 0
camera.position.z = -10

// LIGHT

const pointLight = new THREE.PointLight(0xff88cc, 1.5)
pointLight.position.set(0, 0, -1.5)

// Control
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enablePan = false
controls.maxDistance = 11
controls.minPolarAngle = Math.PI / 2 - 0.2
controls.maxPolarAngle = Math.PI / 2 + 0.2
const initialCameraPosition = { ...camera.position }

// Particles

const particlesGeometry = new THREE.BufferGeometry()
const count = 5000

const positions = new Float32Array(count * 3).map(
  () => (Math.random() - 0.5) * 15
)

particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
)

const particlesMaterial = new THREE.PointsMaterial()
particlesMaterial.size = 0.2
particlesMaterial.sizeAttenuation = true
particlesMaterial.color = new THREE.Color("#ff88cc")
particlesMaterial.map = particleTexture
particlesMaterial.alphaMap = particleTexture
particlesMaterial.alphaTest = 0.001

const particles = new THREE.Points(particlesGeometry, particlesMaterial)

// Plane for image
const planeImageRatio = 590 / 300
console.log("planeImageRatio :", planeImageRatio)

const planeGeometry = new THREE.PlaneBufferGeometry(
  1,
  planeImageRatio,
  600,
  800
)
const countPlaneGeometry = planeGeometry.attributes.position.count
const randoms = new Float32Array(countPlaneGeometry).map(
  () => Math.random() - 0.5
)
planeGeometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1))

const planeMaterial = new THREE.RawShaderMaterial({
  side: THREE.DoubleSide,
  wireframe: false,
  vertexShader: vertexPlaneShader,
  fragmentShader: fragmentPlaneShader,
  uniforms: {
    uTexture: { value: pictureFaceTexture },
    uTime: { value: 0 },
    uDistortionMultiplier: { value: 1 },
  },
})
const plane = new THREE.Points(planeGeometry, planeMaterial)

// Text
let text

fontLoader.load("/fonts/helvetiker_regular.typeface.json", (font) => {
  const generateText = (text) =>
    new TextGeometry(text, {
      font,
      size: 0.05,
      height: 0.01,
      curveSegments: 6,
      bevelEnabled: false,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 4,
    })
  const textGeometry = generateText("get in the portal!!")

  textGeometry.center()

  const textMaterial = new THREE.MeshStandardMaterial({
    wireframe: false,
    color: "pink",
  })
  text = new THREE.Mesh(textGeometry, textMaterial)

  text.rotation.y = Math.PI
  text.position.z = -0.1
  scene.add(text)
  scene.remove(text)
})

// Portal
let colorLerpAlpha = 0
const portalGeometry = new THREE.PlaneBufferGeometry(1, 2, 100, 100)
const portalMaterial = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  vertexShader: vertexPortalShader,
  fragmentShader: fragmentPortalShader,
  uniforms: {
    uTime: { value: 0 },

    uBigWavesElevation: { value: 0.0 },
    uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
    uBigWavesSpeed: { value: 0.75 },

    uSmallWavesElevation: { value: 0.06 },
    uSmallWavesFrequency: { value: 3 },
    uSmallWavesSpeed: { value: 0.5 },
    uSmallIterations: { value: 4 },
    uDepthColor: {
      value: new THREE.Color(0x000000),
    },

    uSurfaceColor: { value: new THREE.Color("black") },
    uColorOffset: { value: 0.08 },
    uColorMultiplier: { value: 5 },
  },
})
const portal = new THREE.Mesh(portalGeometry, portalMaterial)

// Frame

const basicFrameMaterial = new THREE.MeshStandardMaterial({
  color: "white",
  wireframe: false,
  side: THREE.DoubleSide,
})

const generatePartOfFrame = (x, y, z) => {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(x, y, z),
    basicFrameMaterial
  )
  mesh.position.z -= 0.05
  return mesh
}
const top = generatePartOfFrame(1.2, 0.1, 0.1)
top.position.y += 1

const bottom = generatePartOfFrame(1.2, 0.1, 0.1)
bottom.position.y -= 1

const left = generatePartOfFrame(0.1, 2, 0.1)
left.position.x += 0.55

const right = generatePartOfFrame(0.1, 2, 0.1)
right.position.x -= 0.55

// Scene
scene.add(camera)
scene.add(particles)
scene.add(pointLight)
scene.add(top)
scene.add(portal)
scene.add(bottom)
scene.add(left)
scene.add(right)

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
})
renderer.setSize(sizes.width, sizes.height)

let stop = false
const triggerAct2 = (() => {
  let isFirstTime = true

  return () => {
    if (isFirstTime && camera.position.distanceTo(portal.position) < 0.3) {
      clearTimeout(timeoutAutomaticProgressId)
      isFirstTime = false
      scene.remove(text)
      scene.remove(particles)
      scene.remove(portal)
      scene.remove(top)
      scene.remove(bottom)
      scene.remove(right)
      scene.remove(left)

      controls.enabled = true
      controls.enableZoom = false

      gsap.to(camera.position, {
        delay: 0,
        duration: 5,
        z: -5,
        onComplete: () => {
          controls.enableZoom = true
        },
      })

      scene.add(plane)
      setTimeout(() => {
        renderer.domElement.addEventListener("click", () => {
          stop = !stop
        })
      }, 3000)
    }
  }
})()

const automaticallyProgressToAct2 = () => {
  isFirstTimeText = false

  controls.enabled = false

  const duration = 2
  gsap.to(camera.position, {
    duration: duration,
    x: initialCameraPosition.x,
    y: initialCameraPosition.y,
    z: -10,
  })

  gsap.to(camera.position, {
    delay: duration + 0.1,
    duration: 1,
    z: 0,
  })
}

const timeoutAutomaticProgressId = setTimeout(
  automaticallyProgressToAct2,
  45000
)

let isFirstTimeText = true
const triggerText = (() => {
  return () => {
    if (isFirstTimeText && camera.position.distanceTo(portal.position) < 3) {
      isFirstTimeText = false
      scene.add(text)
      setTimeout(() => {
        scene.remove(text)
      }, 2000)
    }
  }
})()

// Animate
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  planeMaterial.uniforms.uTime.value = elapsedTime
  portalMaterial.uniforms.uTime.value = elapsedTime

  colorLerpAlpha = -1 + 10 / camera.position.distanceTo(portal.position)
  if (colorLerpAlpha > 1) colorLerpAlpha = 1
  portalMaterial.uniforms.uDepthColor.value = new THREE.Color().lerpColors(
    new THREE.Color(0x000000),
    new THREE.Color(0xfcc1ff),
    colorLerpAlpha
  )

  if (stop) {
    if (planeMaterial.uniforms.uDistortionMultiplier.value < 0.01) {
      planeMaterial.uniforms.uDistortionMultiplier.value = 0
    } else {
      planeMaterial.uniforms.uDistortionMultiplier.value -= 0.01
    }
  } else {
    if (planeMaterial.uniforms.uDistortionMultiplier.value < 1) {
      planeMaterial.uniforms.uDistortionMultiplier.value += 0.01
    }
  }

  // Update objects
  const particlesVelocity = 0.025

  particles.rotation.y = elapsedTime * particlesVelocity
  particles.rotation.z = elapsedTime * particlesVelocity
  particles.rotation.x = elapsedTime * particlesVelocity

  pointLight.intensity = Math.abs(
    1 / camera.position.distanceTo(portal.position)
  )
  triggerText()
  triggerAct2()
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
