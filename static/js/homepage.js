// Three.js ES6 Module import (moved from inline)
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.177.0/three.module.min.js';
window.THREE = THREE;

// Atlas Divisions Globe Class - Enhanced Animation Implementation
class AtlasGlobe {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.globeMesh = null;

        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.rotationVelocity = { x: 0, y: 0 };
        this.autoRotationSpeed = 0.005; // Fixed consistent rate for west-to-east rotation
        this.friction = 0.95; // Slightly more friction for smoother transitions
        this.rotationSpeed = 0.008; // Adjusted for left-right only interaction

        // Atlas Divisions styling
        this.atlasColors = {
            ocean: '#001122',
            land: '#d4af37',   // Atlas gold
            stroke: '#cd7f32', // Atlas bronze
            atmosphere: 0xd4af37, // Gold atmosphere
            light: 0xd4af37    // Gold lighting
        };

        // Deliberately not calling init() in constructor; will be called by global init function
    }

    init() {
        if (typeof THREE === 'undefined') {
            console.error('Three.js not loaded');
            const container = document.getElementById('globe-container');
            if (container) {
                container.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#d4af37;font-size:4rem;">🌍</div>';
            }
            return;
        }

        this.createScene();
        this.setupEventListeners();
    }

    createScene() {
        const container = document.getElementById('globe-container');
        if (!container) return;

        // Force container to update its computed styles
        // container.style.display = container.style.display; // This line might not be necessary or could cause issues.

        // Wait a moment for CSS to apply, then get dimensions
        // Using requestAnimationFrame for better timing with layout changes
        requestAnimationFrame(() => {
            const width = container.offsetWidth || container.clientWidth;
            const height = container.offsetHeight || container.clientHeight;

            if (width === 0 || height === 0) {
                console.warn('Globe container has zero dimensions. Retrying...');
                setTimeout(() => this.createScene(), 100); // Retry if dimensions are not yet available
                return;
            }
            console.log('Globe container dimensions:', width, 'x', height);

            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
            this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

            this.renderer.setSize(width, height);
            this.renderer.setClearColor(0x000000, 0);
            container.innerHTML = ''; // Clear any fallback content
            container.appendChild(this.renderer.domElement);

            this.camera.position.z = 4;

            this.createGlobe();
            this.setupLighting();
            this.animate();
        });
    }

    async createGlobe() {
        const geometry = new THREE.SphereGeometry(1.5, 64, 64);
        const texture = await this.createAtlasTexture();

        const material = new THREE.MeshPhongMaterial({
            map: texture,
            transparent: true,
            opacity: 0.9
        });

        this.globeMesh = new THREE.Mesh(geometry, material);
        this.globeMesh.rotation.x = 0.1;
        this.scene.add(this.globeMesh);

        this.createAtmosphere();

        this.rotationVelocity.x = 0;
        this.rotationVelocity.y = this.autoRotationSpeed;
    }

    createAtmosphere() {
        const atmosphereGeometry = new THREE.SphereGeometry(1.6, 64, 64);
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: this.atlasColors.atmosphere,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.scene.add(atmosphere);
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(this.atlasColors.light, 0.4);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(this.atlasColors.light, 0.8);
        directionalLight.position.set(5, 3, 5);
        this.scene.add(directionalLight);
    }

    async createAtlasTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = this.atlasColors.ocean;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        try {
            const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
            if (!response.ok) throw new Error(`Failed to fetch GeoJSON: ${response.status}`);
            const geoData = await response.json();
            this.drawWorldMap(ctx, geoData, canvas.width, canvas.height);
        } catch (error) {
            console.warn('Using fallback map due to GeoJSON fetch error:', error);
            this.drawFallbackMap(ctx, canvas.width, canvas.height);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        return texture;
    }

    drawWorldMap(ctx, geoData, width, height) {
        ctx.fillStyle = this.atlasColors.land;
        ctx.strokeStyle = this.atlasColors.stroke;
        ctx.lineWidth = 1;

        geoData.features.forEach(feature => {
            if (feature.geometry && feature.geometry.coordinates) {
                 if (feature.geometry.type === 'Polygon') {
                    this.drawPolygon(ctx, feature.geometry.coordinates, width, height);
                } else if (feature.geometry.type === 'MultiPolygon') {
                    feature.geometry.coordinates.forEach(polygon => {
                        this.drawPolygon(ctx, polygon, width, height);
                    });
                }
            }
        });
    }

    drawPolygon(ctx, coordinates, width, height) {
        coordinates.forEach(ring => {
            ctx.beginPath();
            ring.forEach((coord, index) => {
                const x = ((coord[0] + 180) / 360) * width;
                const y = ((90 - coord[1]) / 180) * height;

                if (index === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        });
    }

    drawFallbackMap(ctx, width, height) {
        const continents = [
            { x: 0.2, y: 0.3, w: 0.25, h: 0.4 }, { x: 0.25, y: 0.5, w: 0.15, h: 0.35 },
            { x: 0.48, y: 0.25, w: 0.12, h: 0.15 }, { x: 0.5, y: 0.35, w: 0.15, h: 0.4 },
            { x: 0.6, y: 0.2, w: 0.3, h: 0.35 }, { x: 0.75, y: 0.65, w: 0.12, h: 0.1 }
        ];
        ctx.fillStyle = this.atlasColors.land;
        continents.forEach(c => ctx.fillRect(c.x * width, c.y * height, c.w * width, c.h * height));
    }

    setupEventListeners() {
        const container = document.getElementById('globe-container');
        if (!container) return;

        container.style.cursor = 'grab';
        container.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this)); // Listen on document for wider drag range
        document.addEventListener('mouseup', this.onMouseUp.bind(this));    // Listen on document
        container.addEventListener('mouseleave', this.onMouseLeave.bind(this));
        container.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false }); // Listen on document
        document.addEventListener('touchend', this.onTouchEnd.bind(this));      // Listen on document
        window.addEventListener('resize', this.onWindowResize.bind(this));

        if (window.ResizeObserver) {
            new ResizeObserver(entries => {
                if (entries[0] && entries[0].target.id === 'globe-container') this.onWindowResize();
            }).observe(container);
        }
    }

    onMouseDown(event) {
        this.isDragging = true;
        const rect = event.currentTarget.getBoundingClientRect();
        this.previousMousePosition = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        event.currentTarget.style.cursor = 'grabbing';
    }

    onMouseMove(event) {
        if (this.isDragging) {
            // No need for getBoundingClientRect here if previousMousePosition is relative to document
            const deltaX = event.clientX - this.previousMousePosition.x;
            // const deltaY = event.clientY - this.previousMousePosition.y; // Y movement ignored

            this.rotationVelocity.x = 0;
            this.rotationVelocity.y = deltaX * this.rotationSpeed;

            this.previousMousePosition = { x: event.clientX, y: event.clientY };
        }
    }

    onMouseUp() {
        if (this.isDragging) {
            this.isDragging = false;
            const container = document.getElementById('globe-container');
            if (container) container.style.cursor = 'grab';
        }
    }

    onMouseLeave(event) {
        // Only stop dragging if the mouse truly left the globe container
        // and is not still being dragged (e.g. mouseup outside)
        if (this.isDragging && event.target.id === 'globe-container') {
             // this.isDragging = false; // Keep dragging if mouse button is still down
             // event.currentTarget.style.cursor = 'grab';
        }
    }

    onTouchStart(event) {
        if (event.touches.length === 1) {
            event.preventDefault();
            this.isDragging = true;
            const touch = event.touches[0];
            const rect = event.currentTarget.getBoundingClientRect();
            this.previousMousePosition = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
        }
    }

    onTouchMove(event) {
        if (this.isDragging && event.touches.length === 1) {
            event.preventDefault();
            const touch = event.touches[0];
            const rect = document.getElementById('globe-container').getBoundingClientRect(); // Use currentTarget if available
            const currentMousePosition = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
            const deltaX = currentMousePosition.x - this.previousMousePosition.x;

            this.rotationVelocity.x = 0;
            this.rotationVelocity.y = deltaX * this.rotationSpeed;

            this.previousMousePosition = currentMousePosition;
        }
    }

    onTouchEnd() {
        this.isDragging = false;
    }

    onWindowResize() {
        const container = document.getElementById('globe-container');
        if (!container || !this.renderer || !this.camera) return;

        const width = container.offsetWidth || container.clientWidth;
        const height = container.offsetHeight || container.clientHeight;

        if (width === 0 || height === 0) return; // Avoid issues if container is hidden

        console.log('Resizing globe canvas to:', width, 'x', height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        if (this.globeMesh && this.renderer && this.scene && this.camera) {
            if (this.isDragging) {
                this.globeMesh.rotation.y += this.rotationVelocity.y;
            } else {
                this.rotationVelocity.y *= this.friction;
                if (Math.abs(this.rotationVelocity.y) > 0.001) {
                    this.globeMesh.rotation.y += this.rotationVelocity.y;
                } else {
                    this.rotationVelocity.y = 0;
                    this.globeMesh.rotation.y += this.autoRotationSpeed;
                }
            }
            this.globeMesh.rotation.x = 0.1;
            this.renderer.render(this.scene, this.camera);
        }
    }
}

// Global instance
let atlasGlobe = null;

// Set up Atlas Globe initialization function
function initAtlasGlobeWhenReady() {
    if (typeof AtlasGlobe !== 'undefined' && typeof THREE !== 'undefined') {
        try {
            if (!atlasGlobe) { // Ensure only one instance is created
                atlasGlobe = new AtlasGlobe();
                atlasGlobe.init(); // Call init explicitly
                console.log('Atlas Globe initialized successfully from homepage.js');
            }
        } catch (error) {
            console.error('Atlas Globe initialization failed from homepage.js:', error);
            const container = document.getElementById('globe-container');
            if (container) {
                container.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#d4af37;font-size:8rem;animation:float 6s ease-in-out infinite;">🌍</div>';
            }
        }
    }
}

// Copy email functionality
function copyEmailGlobal() { // Renamed to avoid conflict if page has other 'copyEmail'
    const email = 'harley@atlasdivisions.com'; // Assuming this is the correct email, or make it dynamic

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(() => {
            showCopyFeedbackGlobal();
        }).catch(() => {
            fallbackCopyMethodGlobal(email);
        });
    } else {
        fallbackCopyMethodGlobal(email);
    }
}

function fallbackCopyMethodGlobal(email) {
    const textArea = document.createElement('textarea');
    textArea.value = email;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        showCopyFeedbackGlobal();
    } catch (err) {
        console.error('Failed to copy email:', err);
    }
    document.body.removeChild(textArea);
}

function showCopyFeedbackGlobal() {
    const feedback = document.getElementById('copy-feedback');
    if (feedback) {
        feedback.style.display = 'inline';
        setTimeout(() => { feedback.style.display = 'none'; }, 2000);
    }
}

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Make copyEmailGlobal available globally for inline onclick, or attach event listeners
    window.copyEmail = copyEmailGlobal;

    // Initialize Atlas Globe
    function initializeGlobeWithRetry(retries = 5, delay = 200) {
        if (document.getElementById('globe-container') && typeof THREE !== 'undefined' && typeof AtlasGlobe !== 'undefined') {
            initAtlasGlobeWhenReady();
        } else if (retries > 0) {
            console.log(`Globe init deferred, ${retries} retries left.`);
            setTimeout(() => initializeGlobeWithRetry(retries - 1, delay), delay);
        } else {
            console.error('Globe initialization failed after multiple retries.');
            const container = document.getElementById('globe-container');
            if (container) {
                container.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#d4af37;font-size:8rem;animation:float 6s ease-in-out infinite;">🌍</div>';
            }
        }
    }

    if (document.readyState === 'loading') {
        window.addEventListener('load', () => initializeGlobeWithRetry());
    } else {
        initializeGlobeWithRetry();
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (atlasGlobe && atlasGlobe.renderer) {
        const container = document.getElementById('globe-container');
        if (container && atlasGlobe.renderer.domElement && container.contains(atlasGlobe.renderer.domElement)) {
            container.removeChild(atlasGlobe.renderer.domElement);
        }
        atlasGlobe.renderer.dispose();
        console.log("AtlasGlobe renderer disposed.");
    }
});
