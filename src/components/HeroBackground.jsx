import { useEffect, useRef } from "react"
import * as THREE from "three"

export default function HeroBackground({
  count = 50,
  opacity = 0.5,
  size = 0.04,
  className = "pointer-events-none absolute inset-0 z-0",
}) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: false,
      powerPreference: "high-performance"
    })
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
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
    })
    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    let animationId = 0
    let lastTime = 0
    const targetFPS = 30
    const frameInterval = 1000 / targetFPS

    const animate = (currentTime) => {
      animationId = window.requestAnimationFrame(animate)
      
      const deltaTime = currentTime - lastTime
      if (deltaTime < frameInterval) return
      
      lastTime = currentTime - (deltaTime % frameInterval)
      
      particles.rotation.y += 0.0008
      particles.rotation.x += 0.0004
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
      window.cancelAnimationFrame(animationId)
      window.removeEventListener("resize", handleResize)
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [count, opacity, size])

  return <div ref={mountRef} className={className} aria-hidden="true" />
}
