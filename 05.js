(() => {
  let R = Math.random;
  let cv = a;
  let ctx = cv.getContext('2d');
  let off = cv.cloneNode();
  let ofx = off.getContext('2d');

  let nodes = [];
  let bursts = [];
  let MAX = 50;

  function createNode() {
    return {
      x: R() * cv.width,
      y: R() * cv.height,
      vx: 0,
      vy: 0,
      r: cv.height * 0.001 + 5 * R(),
      setpoint: R() * Math.PI * 2,
      error: 0.6,
      gain: 31.9 + 0.8 * R(),
      delayBuffer: [],
      emissionPower: 130 + 125 * R()
    };
  }

  function setup() {
    cv.width = off.width = innerWidth;
    cv.height = off.height = innerHeight;
    cv.style.filter = 'saturate(3.4)';

    nodes = [];
    for (let i = 0; i < MAX; i++) {
      nodes.push(createNode());
    }
  }

  window.addEventListener('resize', setup);
  setup();

  (function animate() {
    ofx.fillStyle = `rgba(22, 158, 194, ${(R() * 0.004 - 0.001) + 0.001})`;
    ofx.fillRect(0, 0, off.width, off.height);

    for (let i = bursts.length - 1; i >= 0; i--) {
      let b = bursts[i];
      b.x += b.vx;
      b.y += b.vy;
      b.a -= 0.002;
      if (b.a <= 0) {
        bursts.splice(i, 1);
      } else {
        ofx.fillStyle = b.err > 0
          ? `rgba(225,115,110,${b.a})`
          : `rgba(238,43,226,${b.a})`;
        let norm = Math.max(0, b.err / Math.PI);
        let radius = b.err > 0 ? b.r * (1 + norm * 2) : b.r;
        ofx.beginPath();
        ofx.arc(b.x, b.y, radius, 0, Math.PI * 2);
        ofx.fill();
      }
    }

    nodes.forEach((n, idx) => {
      let leader = idx > 0 ? nodes[idx - 1] : null;
      let err = 0;

      if (leader) {
        err = leader.setpoint - n.setpoint;
        err = ((err + Math.PI) % (2 * Math.PI)) - Math.PI;

        n.delayBuffer.push(err);
        if (n.delayBuffer.length > 5) {
          err = n.delayBuffer.shift();
        }

        n.setpoint += n.gain * err;
      } else {
        n.setpoint += (R() - 0.5) * 125 * Math.PI;
      }

      let speed = 1 + 1 * R() * n.emissionPower * 1.2;
      n.vx = Math.cos(n.setpoint) * speed;
      n.vy = Math.sin(n.setpoint) * speed;
      n.x += n.vx * 0.5 * R();
      n.y += n.vy * 0.3 * R();

      if (n.x < 0) n.x = cv.width;
      if (n.x > cv.width) n.x = 0;
      if (n.y < 0) n.y = cv.height;
      if (n.y > cv.height) n.y = 0;

      let alpha = 0.001 + 0.8 * (1 - idx / (MAX - 1));
      let grad = ofx.createRadialGradient(
        n.x, n.y, n.r * 3 * R(),
        n.x, n.y, n.r
      );
      grad.addColorStop(0, `rgba(35,235,230,${alpha})`);
      grad.addColorStop(1, `rgba(248,133,106,${alpha})`);
      ofx.fillStyle = grad;
      ofx.beginPath();
      ofx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ofx.fill();
    });
    ctx.drawImage(off, 0, 0);
    requestAnimationFrame(animate);
    t.textContent = (Date.now() / 1000).toFixed(3);
  })();
})();
