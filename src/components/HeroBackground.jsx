import { useEffect, useRef, memo } from "react"
import * as THREE from "three"

function HeroBackground({
  count = 50,
  opacity = 0.5,
  size = 0.04,
  className = "pointer-events-none absolute inset-0 z-0",
}) {
  const mountRef = useRef(null)
  const rendererRef = useRef(null)
  const sceneRef = useRef(null)
  const animationIdRef = useRef(0)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    // Reuse scene and renderer if they exist
    if (!sceneRef.current) {
      sceneRef.current = new THREE.Scene()
    }
    const scene = sceneRef.current

    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.z = 5

    if (!rendererRef.current) {
      rendererRef.current = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: false,
        powerPreference: "high-performance",
        stencil: false,
        depth: false,
      })
      rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 1))
    }
    const renderer = rendererRef.current
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    mount.appendChild(renderer.domElement)

    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i += 1) {
      positions[i] = (Math.random() - 0.5) * 12
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      color: 0x3ebf6a,
      size,
      transparent: true,
      opacity,
      sizeAttenuation: true,
    })
    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    let lastTime = 0
    const targetFPS = 24 // Reduced from 30
    const frameInterval = 1000 / targetFPS

    const animate = (currentTime) => {
      animationIdRef.current = window.requestAnimationFrame(animate)
      
      const deltaTime = currentTime - lastTime
      if (deltaTime < frameInterval) return
      
      lastTime = currentTime - (deltaTime % frameInterval)
      
      particles.rotation.y += 0.0006 // Slower rotation
      particles.rotation.x += 0.0003
      renderer.render(scene, camera)
    }
    animate(0)

    const handleResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.cancelAnimationFrame(animationIdRef.current)
      window.removeEventListener("resize", handleResize)
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
      scene.remove(particles)
      geometry.dispose()
      material.dispose()
    }
  }, [count, opacity, size])

  return <div ref={mountRef} className={className} aria-hidden="true" />
}

export default memo(HeroBackground)
