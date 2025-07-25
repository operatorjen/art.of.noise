(() => {
  let R = Math.random;
  let cv = a;
  let cx = a.getContext('2d');
  let off = a.cloneNode();
  let o = off.getContext('2d');

  let nds = [];
  let MAX = 200;

  function createNode() {
    return {
      x: R() * a.width,
      y: R() * a.height,
      vx: 0,
      vy: 0,
      r: a.height * 0.001 + 15 * R(),
      setpoint: R() * Math.PI * 2,
      error: 0.5,
      gain: 10.9 + 0.8 * R(),
      delayBuffer: [],
      emissionPower: 1 + 5 * R(),
      hue: 240 + 20 * R()
    };
  }

  function setup() {
    a.width = off.width = innerWidth;
    a.height = off.height = innerHeight;
    a.style.filter = 'saturate(2)';

    nds = [];
    for (let i = 0; i < MAX; i++) {
      nds.push(createNode());
    }
  }

  (() => {
    function animate() {
      o.fillStyle = `rgba(22, 178, 174, ${(R() * 0.03 - 0.005) + 0.005})`;
      o.fillRect(0, 0, off.width, off.height);

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
          n.setpoint += (R() - 0.5) * 5 * Math.PI;
        }

        let speed = 12 + 1 * R() * n.emissionPower * 10.5;
        n.vx = (R() < 0.9 ? Math.sin(n.setpoint) : Math.cos(n.setpoint)) * speed;
        n.vy = Math.sin(n.setpoint) * speed;
        n.x += n.vx * 0.43 * R();
        n.y += n.vy * 0.3 * R();

        if (n.x < 0) n.x = a.width;
        if (n.x > a.width) n.x = 0;
        if (n.y < 0) n.y = a.height;
        if (n.y > a.height) n.y = 0;

        let alpha = 0.08 + 0.4 * (1 - idx / (MAX - 1));
        let grad = o.createRadialGradient(
          n.x, n.y, n.r * 5 * R(),
          n.x, n.y, n.r
        );
        grad.addColorStop(0, `rgba(235,215,30,${alpha})`);
        grad.addColorStop(1, `rgba(238,153,226,${alpha})`);
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
