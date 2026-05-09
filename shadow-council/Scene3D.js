import * as THREE from 'three';

export class Scene3D {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.particles = [];
    this.init();
  }

  init() {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x0a0a0f, 10, 50);
    
    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 2, 8);
    this.camera.lookAt(0, 0, 0);
    
    // Create renderer
    const canvas = document.getElementById('gameCanvas');
    this.renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true,
      alpha: true 
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap;
    this.renderer.setClearColor(0x0a0a0f, 1);
    
    // Lighting - dark and moody
    const ambientLight = new THREE.AmbientLight(0x4a3a5a, 0.4);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x8866aa, 0.6);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    this.scene.add(directionalLight);
    
    // Rim light for dramatic effect
    const rimLight = new THREE.DirectionalLight(0xaa8866, 0.3);
    rimLight.position.set(-5, 5, -5);
    this.scene.add(rimLight);
    
    // Create atmospheric centerpiece - floating throne/pedestal
    this.createCenterpiece();
    
    // Create ambient particles
    this.createParticles();
    
    // Handle window resize
    window.addEventListener('resize', () => this.onResize());
  }

  createCenterpiece() {
    // Base pedestal
    const pedestalGeometry = new THREE.CylinderGeometry(2, 2.5, 0.5, 8);
    const pedestalMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a1a3a,
      metalness: 0.6,
      roughness: 0.4,
      emissive: 0x1a0a2a,
      emissiveIntensity: 0.2
    });
    const pedestal = new THREE.Mesh(pedestalGeometry, pedestalMaterial);
    pedestal.position.y = -2;
    pedestal.castShadow = true;
    pedestal.receiveShadow = true;
    this.scene.add(pedestal);
    
    // Throne/seat structure
    const throneGeometry = new THREE.BoxGeometry(2, 3, 0.5);
    const throneMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a3a5a,
      metalness: 0.7,
      roughness: 0.3,
      emissive: 0x2a1a3a,
      emissiveIntensity: 0.3
    });
    const throne = new THREE.Mesh(throneGeometry, throneMaterial);
    throne.position.set(0, 0, -1);
    throne.castShadow = true;
    this.scene.add(throne);
    
    // Armrests
    const armGeometry = new THREE.BoxGeometry(0.3, 0.3, 1.5);
    const leftArm = new THREE.Mesh(armGeometry, throneMaterial);
    leftArm.position.set(-1.2, 0.5, -0.5);
    leftArm.castShadow = true;
    this.scene.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, throneMaterial);
    rightArm.position.set(1.2, 0.5, -0.5);
    rightArm.castShadow = true;
    this.scene.add(rightArm);
    
    // Crown/symbol above throne
    const crownGeometry = new THREE.ConeGeometry(0.5, 1, 6);
    const crownMaterial = new THREE.MeshStandardMaterial({
      color: 0xc9a86a,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xc9a86a,
      emissiveIntensity: 0.5
    });
    const crown = new THREE.Mesh(crownGeometry, crownMaterial);
    crown.position.set(0, 3, -1);
    crown.rotation.y = Math.PI / 6;
    this.scene.add(crown);
    
    // Store for animation
    this.crown = crown;
    this.throne = throne;
  }

  createParticles() {
    const particleGeometry = new THREE.SphereGeometry(0.05, 4, 4);
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: 0x8866aa,
      transparent: true,
      opacity: 0.6
    });
    
    // Create floating particles
    for (let i = 0; i < 50; i++) {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      
      particle.position.x = (Math.random() - 0.5) * 20;
      particle.position.y = Math.random() * 10 - 3;
      particle.position.z = (Math.random() - 0.5) * 20;
      
      particle.userData.velocity = {
        x: (Math.random() - 0.5) * 0.02,
        y: Math.random() * 0.02 + 0.01,
        z: (Math.random() - 0.5) * 0.02
      };
      
      this.scene.add(particle);
      this.particles.push(particle);
    }
  }

  update(deltaTime) {
    // Animate crown
    if (this.crown) {
      this.crown.rotation.y += deltaTime * 0.5;
      this.crown.position.y = 3 + Math.sin(Date.now() * 0.001) * 0.1;
    }
    
    // Animate particles
    this.particles.forEach(particle => {
      particle.position.x += particle.userData.velocity.x;
      particle.position.y += particle.userData.velocity.y;
      particle.position.z += particle.userData.velocity.z;
      
      // Wrap around
      if (particle.position.y > 7) particle.position.y = -3;
      if (Math.abs(particle.position.x) > 10) particle.position.x *= -1;
      if (Math.abs(particle.position.z) > 10) particle.position.z *= -1;
    });
    
    // Gentle camera movement
    this.camera.position.x = Math.sin(Date.now() * 0.0001) * 0.3;
    this.camera.lookAt(0, 0, 0);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
