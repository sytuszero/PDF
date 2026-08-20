// ==========================================================================
// ExPDF — 3D Interactive Physics Particle Engine (100% Original X-Stein Code)
// ==========================================================================

(function initExPDF3D() {
    'use strict';

    function sampleIconBitmapParticles(iconType, count) {
        var c = document.createElement('canvas');
        c.width = 320;
        c.height = 320;
        var ctx = c.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#ffffff';

        if (iconType === 'pdf') {
            // EXPDF — Document with corner fold (100% Exact X-Stein Sampling)
            ctx.lineWidth = 0;
            // Back page
            ctx.globalAlpha = 0.55;
            ctx.beginPath();
            ctx.moveTo(85, 55); ctx.lineTo(215, 55);
            ctx.lineTo(215, 275); ctx.lineTo(85, 275);
            ctx.closePath();
            ctx.fill();
            // Front page
            ctx.globalAlpha = 1.0;
            ctx.beginPath();
            ctx.moveTo(70, 45); ctx.lineTo(205, 45);
            ctx.lineTo(240, 80); ctx.lineTo(240, 280);
            ctx.lineTo(70, 280);
            ctx.closePath();
            ctx.fill();
            // Punch out interior
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.moveTo(88, 95); ctx.lineTo(222, 95);
            ctx.lineTo(222, 265); ctx.lineTo(88, 265);
            ctx.closePath();
            ctx.fill();
            // Fold triangle
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1.0;
            ctx.beginPath();
            ctx.moveTo(205, 45); ctx.lineTo(240, 80); ctx.lineTo(205, 80);
            ctx.closePath();
            ctx.fill();
            // Text lines
            ctx.lineWidth = 12;
            ctx.strokeStyle = '#ffffff';
            [[100,125,210,125],[100,155,210,155],[100,185,210,185],[100,215,165,215]].forEach(function(l){
                ctx.beginPath(); ctx.moveTo(l[0],l[1]); ctx.lineTo(l[2],l[3]); ctx.stroke();
            });
        }

        var imgData = ctx.getImageData(0, 0, 320, 320);
        var pixels = imgData.data;
        var validPoints = [];

        for (var y = 0; y < 320; y += 1) {
            for (var x = 0; x < 320; x += 1) {
                var idx = (y * 320 + x) * 4;
                if (pixels[idx + 3] > 180) {
                    validPoints.push({
                        x: (x / 320 - 0.5) * 3.8,
                        y: -(y / 320 - 0.5) * 3.8
                    });
                }
            }
        }

        // Auto-center shape bounding box to exact origin (0,0)
        if (validPoints.length > 0) {
            var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
            for (var v = 0; v < validPoints.length; v++) {
                if (validPoints[v].x < minX) minX = validPoints[v].x;
                if (validPoints[v].x > maxX) maxX = validPoints[v].x;
                if (validPoints[v].y < minY) minY = validPoints[v].y;
                if (validPoints[v].y > maxY) maxY = validPoints[v].y;
            }
            var centerX = (minX + maxX) / 2;
            var centerY = (minY + maxY) / 2;
            for (var w = 0; w < validPoints.length; w++) {
                validPoints[w].x -= centerX;
                validPoints[w].y -= centerY;
            }
        }

        // Fisher-Yates shuffle for uniform particle distribution
        for (var s = validPoints.length - 1; s > 0; s--) {
            var r = Math.floor(Math.random() * (s + 1));
            var temp = validPoints[s];
            validPoints[s] = validPoints[r];
            validPoints[r] = temp;
        }

        var pos = new Float32Array(count * 3);
        if (validPoints.length === 0) return pos;

        for (var i = 0; i < count; i++) {
            var pt = validPoints[i % validPoints.length];
            var jz = (Math.random() - 0.5) * 0.04;
            pos[i * 3]     = pt.x;
            pos[i * 3 + 1] = pt.y;
            pos[i * 3 + 2] = jz;
        }
        return pos;
    }

    function createParticleTexture() {
        var pCanvas = document.createElement('canvas');
        pCanvas.width = 256;
        pCanvas.height = 256;
        var pCtx = pCanvas.getContext('2d');
        pCtx.clearRect(0, 0, 256, 256);

        var grad = pCtx.createRadialGradient(128, 128, 0, 128, 128, 120);
        grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
        grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.92)');
        grad.addColorStop(0.85, 'rgba(255, 255, 255, 0.45)');
        grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');

        pCtx.fillStyle = grad;
        pCtx.beginPath();
        pCtx.arc(128, 128, 120, 0, Math.PI * 2);
        pCtx.fill();

        var tex = new THREE.CanvasTexture(pCanvas);
        tex.needsUpdate = true;
        return tex;
    }

    function generateGradientColors(posArray, count, hex1, hex2, hex3) {
        var colors = new Float32Array(count * 3);
        if (!posArray || posArray.length === 0) return colors;

        var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (var i = 0; i < count; i++) {
            var x = posArray[i * 3];
            var y = posArray[i * 3 + 1];
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }

        var rangeX = (maxX - minX) || 1;
        var rangeY = (maxY - minY) || 1;

        var c1 = new THREE.Color(hex1 || '#da7756');
        var c2 = new THREE.Color(hex2 || '#38bdf8');
        var c3 = new THREE.Color(hex3 || '#ffffff');
        var col = new THREE.Color();

        for (var k = 0; k < count; k++) {
            var px = posArray[k * 3];
            var py = posArray[k * 3 + 1];
            var factor = ((px - minX) / rangeX + (maxY - py) / rangeY) * 0.5;
            factor = Math.max(0, Math.min(1, factor));

            if (factor < 0.5) {
                col.copy(c1).lerp(c2, factor * 2.0);
            } else {
                col.copy(c2).lerp(c3, (factor - 0.5) * 2.0);
            }

            colors[k * 3]     = col.r;
            colors[k * 3 + 1] = col.g;
            colors[k * 3 + 2] = col.b;
        }
        return colors;
    }

    function init3D() {
        var canvas3d = document.getElementById('particle-3d-canvas');
        if (!canvas3d || typeof THREE === 'undefined') return;

        var container = canvas3d.parentElement;
        var width = container.clientWidth || 400;
        var height = container.clientHeight || 240;

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0, window.innerWidth <= 768 ? 2.8 : 3.4);
        camera.lookAt(0, 0, 0);

        var renderer = new THREE.WebGLRenderer({ canvas: canvas3d, alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        var PARTICLE_COUNT = 50000;
        var geometry = new THREE.BufferGeometry();
        var pdfHomePos = sampleIconBitmapParticles('pdf', PARTICLE_COUNT);
        var pdfColors  = generateGradientColors(pdfHomePos, PARTICLE_COUNT, '#da7756', '#38bdf8', '#ffffff');

        var targetHomePos  = new Float32Array(pdfHomePos);
        var currentPos     = new Float32Array(pdfHomePos);
        var currentColors  = new Float32Array(pdfColors);
        var velocities     = new Float32Array(PARTICLE_COUNT * 3);

        geometry.setAttribute('position', new THREE.BufferAttribute(currentPos, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(currentColors, 3));

        var material = new THREE.PointsMaterial({
            size: 0.038,
            sizeAttenuation: true,
            map: createParticleTexture(),
            transparent: true,
            alphaTest: 0.08,
            opacity: 0.95,
            blending: THREE.NormalBlending,
            depthWrite: false,
            vertexColors: true
        });

        var particleMesh = new THREE.Points(geometry, material);
        scene.add(particleMesh);

        var mouse3D = new THREE.Vector3(-999, -999, 0);
        var localMouse3D = new THREE.Vector3(-999, -999, 0);
        var prevMouse3D = new THREE.Vector3(-999, -999, 0);
        var mouseVelocity = new THREE.Vector3(0, 0, 0);
        var raycaster = new THREE.Raycaster();
        var mouse2D = new THREE.Vector2(-999, -999);

        function updateMouse3D(e) {
            var rect = container.getBoundingClientRect();
            mouse2D.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse2D.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse2D, camera);
            var planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
            var targetIntersection = new THREE.Vector3();
            raycaster.ray.intersectPlane(planeZ, targetIntersection);
            if (targetIntersection) {
                if (prevMouse3D.x !== -999) {
                    mouseVelocity.x = (targetIntersection.x - prevMouse3D.x) * 0.4;
                    mouseVelocity.y = (targetIntersection.y - prevMouse3D.y) * 0.4;
                }
                mouse3D.copy(targetIntersection);
                prevMouse3D.copy(targetIntersection);
            }
        }

        container.addEventListener('mousemove', updateMouse3D);
        container.addEventListener('mouseleave', function() {
            mouse3D.set(-999, -999, 0);
            localMouse3D.set(-999, -999, 0);
            prevMouse3D.set(-999, -999, 0);
            mouseVelocity.set(0, 0, 0);
            mouse2D.set(-999, -999);
        });

        // Click Ripple physics
        container.addEventListener('click', function(e) {
            updateMouse3D(e);
            var positions = geometry.attributes.position.array;
            for (var i = 0; i < PARTICLE_COUNT; i++) {
                var ix = i * 3;
                var dx = positions[ix] - localMouse3D.x;
                var dy = positions[ix + 1] - localMouse3D.y;
                var dz = positions[ix + 2] - localMouse3D.z;
                var dist = Math.sqrt(dx*dx + dy*dy + dz*dz) + 0.01;

                if (dist < 1.6) {
                    var force = (1.6 - dist) * 0.02;
                    velocities[ix]     += (dx / dist) * force + (Math.random() - 0.5) * 0.01;
                    velocities[ix + 1] += (dy / dist) * force + (Math.random() - 0.5) * 0.01;
                    velocities[ix + 2] += (dz / dist) * force + (Math.random() - 0.5) * 0.01;
                }
            }
        });

        window.addEventListener('resize', function() {
            var w = container.clientWidth || 400;
            var h = container.clientHeight || 300;
            camera.aspect = w / h;
            camera.position.z = window.innerWidth <= 768 ? 2.8 : 3.4;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        });

        var animId = null;
        var isPaused = false;

        function animate3d() {
            if (isPaused) return;
            animId = requestAnimationFrame(animate3d);

            particleMesh.updateMatrixWorld();
            var invMatrix = particleMesh.matrixWorld.clone().invert();

            if (mouse2D.x !== -999) {
                var rayLocal = raycaster.ray.clone().applyMatrix4(invMatrix);
                var planeLocal = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
                var localHit = new THREE.Vector3();
                if (rayLocal.intersectPlane(planeLocal, localHit)) {
                    localMouse3D.copy(localHit);
                } else {
                    localMouse3D.copy(mouse3D).applyMatrix4(invMatrix);
                }
            } else {
                localMouse3D.set(-999, -999, 0);
            }

            var positions = geometry.attributes.position.array;

            for (var i = 0; i < PARTICLE_COUNT; i++) {
                var ix = i * 3;
                var iy = ix + 1;
                var iz = ix + 2;

                var hx = targetHomePos[ix];
                var hy = targetHomePos[iy];
                var hz = targetHomePos[iz];

                if (mouse2D.x !== -999) {
                    var gdx = positions[ix] - localMouse3D.x;
                    var gdy = positions[iy] - localMouse3D.y;
                    var gdistSq = gdx * gdx + gdy * gdy;
                    if (gdistSq < 0.45) {
                        var gdist = Math.sqrt(gdistSq) + 0.001;
                        var influence = (0.67 - gdist) / 0.67;
                        if (influence > 0) {
                            var pushForce = influence * 0.012;
                            velocities[ix] += (gdx / gdist) * pushForce + mouseVelocity.x * 0.02;
                            velocities[iy] += (gdy / gdist) * pushForce + mouseVelocity.y * 0.02;
                        }
                    }
                }

                velocities[ix] += (hx - positions[ix]) * 0.015;
                velocities[iy] += (hy - positions[iy]) * 0.015;
                velocities[iz] += (hz - positions[iz]) * 0.015;

                velocities[ix] *= 0.94;
                velocities[iy] *= 0.94;
                velocities[iz] *= 0.94;

                positions[ix] += velocities[ix];
                positions[iy] += velocities[iy];
                positions[iz] += velocities[iz];
            }

            mouseVelocity.x *= 0.85;
            mouseVelocity.y *= 0.85;

            geometry.attributes.position.needsUpdate = true;
            particleMesh.rotation.set(0, 0, 0);

            renderer.render(scene, camera);
        }

        animate3d();

        // Observer to pause animation when idle-state is hidden
        var idleEl = document.getElementById('idle-state');
        if (idleEl && typeof MutationObserver !== 'undefined') {
            var observer = new MutationObserver(function() {
                var isHidden = idleEl.classList.contains('hidden') || idleEl.style.display === 'none';
                if (isHidden && !isPaused) {
                    isPaused = true;
                    if (animId) cancelAnimationFrame(animId);
                } else if (!isHidden && isPaused) {
                    isPaused = false;
                    animate3d();
                }
            });
            observer.observe(idleEl, { attributes: true, attributeFilter: ['class', 'style'] });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init3D);
    } else {
        init3D();
    }
})();
