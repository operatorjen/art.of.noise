(() => {
  let R = Math.random;
  let cx = a.getContext('2d');
  let off = a.cloneNode();
  let o = off.getContext('2d');

  let nds = [];
  let MAX = 240;

  function createNode() {
    return {
      x: a.width / 2,
      y: 20 + R() * 20,
      vx: 0,
      vy: 0,
      r: a.height * 0.005 + 15 * R(),
      setpoint: R() * Math.PI * 2,
      error: 0.3,
      gain: 120 + 10.1 * R(),
      delayBuffer: [],
      emissionPower: 10 + 22 * R()
    };
  }

  function setup() {
    a.width = off.width = innerWidth; a.height = off.height = innerHeight;
    a.style.filter = 'saturate(3.7)';
    nds = [];
    for (let i = 0; i < MAX; i++) {
      nds.push(createNode());
    }
  }

  (() => {
    function animate() {
      o.fillStyle = `rgba(170, 120, 100, ${(R() * 0.01)})`;
      o.fillRect(0, 0, off.width, off.height);

      nds.forEach((n, idx) => {
        let leader = idx > 0 ? nds[idx - 1] : null;
        let err = 0;

        if (leader) {
          err = leader.setpoint - n.setpoint;
          err = ((err + Math.PI) % (2 * Math.PI)) - Math.PI;

          n.delayBuffer.push(err);
          if (n.delayBuffer.length > 50) {
            err = n.delayBuffer.shift();
          }

          n.setpoint += n.gain * err;
        } else {
          n.setpoint += (R() - 0.5) * 15 * Math.PI;
        }

        let speed = 10 + 1 * R() * n.emissionPower * 25;
        n.vx = Math.cos(n.setpoint) * speed;
        n.vy = Math.sin(n.setpoint) * speed;
        n.x += n.vx * 0.05 * R();
        n.y += R();

        if (n.x < 0) n.x = a.width;
        if (n.x > a.width) n.x = 0;
        if (n.y < 0) n.y = a.height;
        if (n.y > a.height) {
          n.y = 20 + R() * 20; n.x = a.width / 2;
        }

        let alpha = 0.001 + 0.001 * (1 - idx / (MAX - 1));
        let grad = o.createRadialGradient(
          n.x, n.y, n.r * 5 * R(),
          n.x, n.y, n.r
        );
        grad.addColorStop(0, `rgba(120,135,210,${alpha + 0.5})`);
        grad.addColorStop(1, `rgba(18,93,16,${alpha + 0.01})`);
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
