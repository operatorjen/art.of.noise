(() => {
  let R = Math.random;
  let cx = a.getContext('2d');
  let off = a.cloneNode();
  let o = off.getContext('2d');

  let nds = [];
  let bts = [];
  let MAX = 100;

  function createNode() {
    return {
      x: a.width / 2 + (R() - 0.5) * a.width * 0.5,
      y: a.height / 2 + (R() - 0.5) * a.height * 0.5,
      vx: 0,
      vy: 0,
      r: a.height * 0.001 + 35 * R(),
      setpoint: R() * Math.PI * 2,
      error: 0.1,
      gain: 5 + 3.8 * R(),
      delayBuffer: [],
      emissionPower: 1 + 5 * R()
    };
  }

  function setup() {
    a.width = off.width = innerWidth; a.height = off.height = innerHeight;
    a.style.filter = 'saturate(3.4)';
    nds = [];
    for (let i = 0; i < MAX; i++) {
      nds.push(createNode());
    }
  }

  (() => {
    function animate() {
      o.fillStyle = `rgba(42, 138, 184, ${(R() * 0.01 - 0.005) + 0.005})`;
      o.fillRect(0, 0, off.width, off.height);

      for (let i = bts.length - 1; i >= 0; i--) {
        let b = bts[i];
        b.x += b.vx;
        b.y += b.vy;
        b.a -= 0.02;
        if (b.a <= 0) {
          bts.splice(i, 1);
        } else {
          o.fillStyle = b.err > 0
            ? `rgba(25,115,210,${b.a})`
            : `rgba(238,43,226,${b.a})`;
          let norm = Math.max(0, b.err / Math.PI);
          let radius = b.err > 0 ? b.r * (1 + norm * 2) : b.r;
          o.beginPath();
          o.arc(b.x, b.y, radius, 0, Math.PI * 2);
          o.fill();
        }
      }

      nds.forEach((n, idx) => {
        let leader = idx > 0 ? nds[idx - 1] : null;
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
          n.setpoint += (R() - 0.5) * 120 * Math.PI;
        }

        let speed = 1 + 1 * R() * n.emissionPower * 1.2;
        n.vx = Math.cos(n.setpoint) * speed;
        n.vy = Math.sin(n.setpoint) * speed;
        n.x += n.vx * 5.5 * R();
        n.y += n.vy * 5.5 * R();

        if (n.x < 0) n.x = a.width;
        if (n.x > a.width) n.x = 0;
        if (n.y < 0) n.y = a.height;
        if (n.y > a.height) n.y = 0;

        let alpha = 0.01 + 0.01 * (1 - idx / (MAX - 1));
        let grad = o.createRadialGradient(
          n.x, n.y, n.r * 5 * R(),
          n.x, n.y, n.r
        );
        grad.addColorStop(0, `rgba(35,195,210,${alpha})`);
        grad.addColorStop(0.8, `rgba(238,133,106,${alpha})`);
        o.fillStyle = grad;
        o.beginPath();
        o.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        o.fill();
      });
      cx.drawImage(off, 0, 0);
      window.rafId = requestAnimationFrame(animate)
      t.textContent = (Date.now() / 1000).toFixed(3);
    }

    registerExhibit(setup, animate);
  })();
})();
