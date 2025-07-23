(() => {
  let R = Math.random;
  let cx = a.getContext('2d');
  let off = a.cloneNode();
  let o = off.getContext('2d');

  let nds = [];
  let bts = [];
  let MAX = 80;

  function createNode() {
    return {
      x: R() * a.width,
      y: R() * a.height,
      vx: 0,
      vy: 0,
      r: a.height * 0.001 + 25 * R(),
      setpoint: R() * Math.PI * 2,
      error: 0.1,
      gain: 0.9 + 0.8 * R(),
      delayBuffer: [],
      emissionPower: 1 + 5 * R(),
      hue: 140 + 80 * R()
    };
  }

  function setup() {
    a.width = off.width = innerWidth;
    a.height = off.height = innerHeight;
    a.style.filter = 'saturate(3)';

    nds = [];
    for (let i = 0; i < MAX; i++) {
      nds.push(createNode());
    }
  }

  function emitBurst(n, err) {
    let angle = n.setpoint;
    let speed = n.emissionPower;
    bts.push({
      x: n.x,
      y: n.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: 1 + 3 * R(),
      a: 1,
      err
    });
  }

  (() => {
    function animate() {
      o.fillStyle = 'rgba(120, 19, 93, 0.01)';
      o.fillRect(0, 0, off.width, off.height);

      for (let i = bts.length - 1; i >= 0; i--) {
        let b = bts[i];
        b.x += b.vx;
        b.y += b.vy;
        b.a -= 0.1;
        if (b.a <= 0) {
          bts.splice(i, 1);
        } else {
          o.fillStyle = b.err > 0
            ? `rgba(125,115,0,${b.a})`
            : `rgba(38,43,226,${b.a})`;
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
          if (n.delayBuffer.length > 30) {
            err = n.delayBuffer.shift();
          }

          n.setpoint += n.gain * err;
        } else {
          n.setpoint += (R() - 0.5) * 15 * Math.PI;
        }

        let speed = 2 + 1 * R() * n.emissionPower * 20.5;
        n.vx = Math.cos(n.setpoint) * speed;
        n.vy = Math.sin(n.setpoint) * speed;
        n.x += n.vx * 0.53;
        n.y += n.vy * 0.53;

        if (n.x < 0) n.x = a.width;
        if (n.x > a.width) n.x = 0;
        if (n.y < 0) n.y = a.height;
        if (n.y > a.height) n.y = 0;

        if (R() < 0.02) emitBurst(n, err);

        let alpha = 0.3 + 0.1 * (1 - idx / (MAX - 1));
        let grad = o.createRadialGradient(
          n.x, n.y, n.r * 0.5,
          n.x, n.y, n.r
        );
        grad.addColorStop(0, `rgba(35,215,100,${alpha})`);
        grad.addColorStop(0.8, `rgba(138,53,226,${alpha})`);
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
