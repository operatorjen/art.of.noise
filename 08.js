(() => {
  let R = Math.random;
  let cx = a.getContext('2d');
  let off = a.cloneNode();
  let o = off.getContext('2d');

  let nds = [];
  let bts = [];
  let MAX = 55;

  function createNode() {
    return {
      x: a.width / 2 + (R() - 0.5) * a.width * 0.5,
      y: a.height / 2 + (R() - 0.5) * a.height * 0.5,
      vx: 0,
      vy: 0,
      r: a.height * 0.001 + 13 * R(),
      setpoint: R() * Math.PI * 2,
      error: 0.1,
      gain: 15 + 10.85 * R(),
      delayBuffer: [],
      emissionPower: 12 + 20 * R()
    };
  }

  function setup() {
    a.width = off.width = innerWidth; a.height = off.height = innerHeight;
    a.style.filter = 'saturate(2.4)';
    nds = [];
    for (let i = 0; i < MAX; i++) {
      nds.push(createNode());
    }
  }

  (() => {
    function animate() {
      o.fillStyle = `rgba(80, 90, 74, ${(R() * 0.02)})`;
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

        let speed = 10 + 1 * R() * n.emissionPower * 5;
        n.vx = Math.cos(n.setpoint) * speed;
        n.vy = Math.sin(n.setpoint) * speed;
        n.x += n.vx * 0.05 * R();
        n.y += n.vy * 0.05 * R();

        if (n.x < 0) n.x = a.width;
        if (n.x > a.width) n.x = 0;
        if (n.y < 0) n.y = a.height;
        if (n.y > a.height) n.y = 0;

        let alpha = 0.1 + 0.01 * (1 - idx / (MAX - 1));
        let grad = o.createRadialGradient(
          n.x, n.y, n.r * 25 * R(),
          n.x, n.y, n.r
        );
        grad.addColorStop(0, `rgba(220,35,110,${alpha + 0.3})`);
        grad.addColorStop(1, `rgba(18,103,216,${alpha})`);
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
