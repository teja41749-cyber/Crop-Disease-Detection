export function createLeafScanAnimation(container) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const size = 200;
  
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.maxWidth = '280px';
  svg.style.maxHeight = '280px';
  svg.classList.add('leaf-scan-animation');

  const leafPath = document.createElementNS(svgNS, 'path');
  leafPath.setAttribute('d', 'M100 15C50 40 20 80 20 115c0 35 30 70 80 90 50-20 80-55 80-90C180 80 150 40 100 15z');
  leafPath.setAttribute('fill', '#E8F5E9');
  leafPath.setAttribute('stroke', '#2E7D32');
  leafPath.setAttribute('stroke-width', '2.5');
  leafPath.classList.add('leaf-shape');

  const centerVein = document.createElementNS(svgNS, 'path');
  centerVein.setAttribute('d', 'M100 15v170');
  centerVein.setAttribute('stroke', '#4CAF50');
  centerVein.setAttribute('stroke-width', '1.5');
  centerVein.setAttribute('opacity', '0.6');
  centerVein.classList.add('center-vein');

  const sideVeins = document.createElementNS(svgNS, 'g');
  sideVeins.classList.add('side-veins');
  const veinData = [
    'M100 45c15-10 30-20 45-25',
    'M100 45c-15-10 -30-20 -45-25',
    'M100 80c20-8 40-15 55-20',
    'M100 80c-20-8 -40-15 -55-20',
    'M100 115c22 5 44 12 60 22',
    'M100 115c-22 5 -44 12 -60 22',
    'M100 145c20 12 38 25 50 35',
    'M100 145c-20 12 -38 25 -50 35'
  ];
  veinData.forEach(d => {
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('stroke', '#4CAF50');
    path.setAttribute('stroke-width', '1');
    path.setAttribute('opacity', '0.4');
    path.setAttribute('fill', 'none');
    sideVeins.appendChild(path);
  });

  const scanLine = document.createElementNS(svgNS, 'line');
  scanLine.setAttribute('x1', '0');
  scanLine.setAttribute('x2', '200');
  scanLine.setAttribute('y1', '0');
  scanLine.setAttribute('y2', '0');
  scanLine.setAttribute('stroke', 'url(#scanGradient)');
  scanLine.setAttribute('stroke-width', '3');
  scanLine.setAttribute('stroke-linecap', 'round');
  scanLine.classList.add('scan-line');

  const defs = document.createElementNS(svgNS, 'defs');
  const gradient = document.createElementNS(svgNS, 'linearGradient');
  gradient.setAttribute('id', 'scanGradient');
  gradient.setAttribute('x1', '0%');
  gradient.setAttribute('x2', '100%');
  gradient.innerHTML = `
    <stop offset="0%" stop-color="#4CAF50" stop-opacity="0"/>
    <stop offset="50%" stop-color="#4CAF50" stop-opacity="1"/>
    <stop offset="100%" stop-color="#4CAF50" stop-opacity="0"/>
  `;
  defs.appendChild(gradient);

  const pulseRing = document.createElementNS(svgNS, 'circle');
  pulseRing.setAttribute('cx', '100');
  pulseRing.setAttribute('cy', '100');
  pulseRing.setAttribute('r', '60');
  pulseRing.setAttribute('fill', 'none');
  pulseRing.setAttribute('stroke', '#4CAF50');
  pulseRing.setAttribute('stroke-width', '2');
  pulseRing.setAttribute('opacity', '0');
  pulseRing.classList.add('pulse-ring');

  svg.appendChild(defs);
  svg.appendChild(leafPath);
  svg.appendChild(centerVein);
  svg.appendChild(sideVeins);
  svg.appendChild(scanLine);
  svg.appendChild(pulseRing);

  container.innerHTML = '';
  container.appendChild(svg);

  let scanPosition = -20;
  let scanDirection = 1;
  let pulseScale = 0;
  let pulseOpacity = 0;
  let animationId = null;

  function animate() {
    scanPosition += 1.5 * scanDirection;
    if (scanPosition > 220) {
      scanPosition = -20;
      scanDirection = 1;
    }

    pulseScale += 0.015;
    pulseOpacity = Math.max(0, 0.6 - pulseScale * 0.4);
    if (pulseScale > 1.5) {
      pulseScale = 0;
    }

    scanLine.setAttribute('y1', scanPosition);
    scanLine.setAttribute('y2', scanPosition);

    pulseRing.setAttribute('r', 50 + pulseScale * 50);
    pulseRing.setAttribute('opacity', pulseOpacity);

    animationId = requestAnimationFrame(animate);
  }

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    animate();
  }

  return {
    destroy() {
      if (animationId) cancelAnimationFrame(animationId);
    }
  };
}

export function createLoadingAnimation(container) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const size = 120;
  
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.maxWidth = '120px';
  svg.style.maxHeight = '120px';
  svg.classList.add('loading-animation');

  const defs = document.createElementNS(svgNS, 'defs');
  const gradient = document.createElementNS(svgNS, 'linearGradient');
  gradient.setAttribute('id', 'loadingGradient');
  gradient.setAttribute('x1', '0%');
  gradient.setAttribute('y1', '0%');
  gradient.setAttribute('x2', '100%');
  gradient.setAttribute('y2', '0%');
  gradient.innerHTML = `
    <stop offset="0%" stop-color="#4CAF50"/>
    <stop offset="100%" stop-color="#81C784"/>
  `;
  defs.appendChild(gradient);

  const leaf = document.createElementNS(svgNS, 'path');
  leaf.setAttribute('d', 'M60 10C30 30 10 60 10 90c0 30 20 55 50 70 30-15 50-40 50-70C110 60 90 30 60 10z');
  leaf.setAttribute('fill', 'url(#loadingGradient)');
  leaf.setAttribute('transform-origin', '60 100');
  leaf.classList.add('loading-leaf');

  const particles = document.createElementNS(svgNS, 'g');
  particles.classList.add('loading-particles');
  for (let i = 0; i < 8; i++) {
    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('r', '3');
    circle.setAttribute('fill', '#4CAF50');
    circle.setAttribute('opacity', '0');
    circle.setAttribute('data-index', i);
    particles.appendChild(circle);
  }

  svg.appendChild(defs);
  svg.appendChild(particles);
  svg.appendChild(leaf);

  container.innerHTML = '';
  container.appendChild(svg);

  let angle = 0;
  let particlePhase = 0;
  let animationId = null;

  function animate() {
    angle += 1.5;
    particlePhase += 0.05;

    leaf.setAttribute('transform', `rotate(${Math.sin(angle * Math.PI / 180) * 3} 60 100)`);

    const particlesArray = particles.querySelectorAll('circle');
    particlesArray.forEach((particle, i) => {
      const delay = i * 0.4;
      const phase = particlePhase + delay;
      const radius = 40 + Math.sin(phase) * 25;
      const theta = (i / 8) * Math.PI * 2 + particlePhase * 0.5;
      const x = 60 + Math.cos(theta) * radius;
      const y = 100 - Math.sin(phase * 2) * 60 - 40;
      const opacity = Math.max(0, Math.sin(phase) * 0.8);
      
      particle.setAttribute('cx', x);
      particle.setAttribute('cy', y);
      particle.setAttribute('opacity', opacity);
      particle.setAttribute('r', 2 + Math.sin(phase) * 1.5);
    });

    animationId = requestAnimationFrame(animate);
  }

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    animate();
  }

  return {
    destroy() {
      if (animationId) cancelAnimationFrame(animationId);
    }
  };
}

export function createResultAnimation(container, isHealthy) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const size = 160;
  
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.style.maxWidth = '160px';
  svg.style.maxHeight = '160px';
  svg.classList.add('result-animation');

  const defs = document.createElementNS(svgNS, 'defs');
  const gradient = document.createElementNS(svgNS, 'radialGradient');
  gradient.setAttribute('id', 'resultGradient');
  gradient.innerHTML = `
    <stop offset="0%" stop-color="${isHealthy ? '#81C784' : '#FFB300'}"/>
    <stop offset="100%" stop-color="${isHealthy ? '#2E7D32' : '#F57F17'}"/>
  `;
  defs.appendChild(gradient);

  const circle = document.createElementNS(svgNS, 'circle');
  circle.setAttribute('cx', '80');
  circle.setAttribute('cy', '80');
  circle.setAttribute('r', '70');
  circle.setAttribute('fill', 'none');
  circle.setAttribute('stroke', 'url(#resultGradient)');
  circle.setAttribute('stroke-width', '6');
  circle.setAttribute('stroke-dasharray', '439.8');
  circle.setAttribute('stroke-dashoffset', '439.8');
  circle.setAttribute('transform', 'rotate(-90 80 80)');
  circle.classList.add('result-circle');

  const icon = document.createElementNS(svgNS, 'g');
  icon.setAttribute('transform', 'translate(80, 80) scale(0)');
  icon.classList.add('result-icon');

  if (isHealthy) {
    const checkmark = document.createElementNS(svgNS, 'path');
    checkmark.setAttribute('d', 'M-20 0 L-5 15 L25 -20');
    checkmark.setAttribute('fill', 'none');
    checkmark.setAttribute('stroke', '#2E7D32');
    checkmark.setAttribute('stroke-width', '4');
    checkmark.setAttribute('stroke-linecap', 'round');
    checkmark.setAttribute('stroke-linejoin', 'round');
    checkmark.setAttribute('stroke-dasharray', '55');
    checkmark.setAttribute('stroke-dashoffset', '55');
    checkmark.classList.add('checkmark');
    icon.appendChild(checkmark);
  } else {
    const warning = document.createElementNS(svgNS, 'path');
    warning.setAttribute('d', 'M0 -25 L20 20 L-20 20 Z');
    warning.setAttribute('fill', '#F57F17');
    warning.classList.add('warning-icon');
    icon.appendChild(warning);

    const exclaim = document.createElementNS(svgNS, 'text');
    exclaim.setAttribute('x', '0');
    exclaim.setAttribute('y', '8');
    exclaim.setAttribute('text-anchor', 'middle');
    exclaim.setAttribute('font-size', '28');
    exclaim.setAttribute('font-weight', 'bold');
    exclaim.setAttribute('fill', 'white');
    exclaim.textContent = '!';
    icon.appendChild(exclaim);
  }

  svg.appendChild(defs);
  svg.appendChild(circle);
  svg.appendChild(icon);

  container.innerHTML = '';
  container.appendChild(svg);

  let progress = 0;
  let animationId = null;
  const duration = 1000;
  const startTime = performance.now();

  function animate(time) {
    const elapsed = time - startTime;
    progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    circle.setAttribute('stroke-dashoffset', 439.8 * (1 - eased));

    if (progress > 0.5) {
      const iconProgress = Math.min((progress - 0.5) * 2, 1);
      const iconEased = 1 - Math.pow(1 - iconProgress, 3);
      icon.setAttribute('transform', `translate(80, 80) scale(${iconEased})`);
      
      if (isHealthy) {
        const checkmark = icon.querySelector('.checkmark');
        if (checkmark) {
          checkmark.setAttribute('stroke-dashoffset', 55 * (1 - iconEased));
        }
      }
    }

    if (progress < 1) {
      animationId = requestAnimationFrame(animate);
    }
  }

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    animationId = requestAnimationFrame(animate);
  }

  return {
    destroy() {
      if (animationId) cancelAnimationFrame(animationId);
    }
  };
}