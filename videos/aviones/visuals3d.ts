// Custom visuals of "¿Por qué vuelan los aviones?" (3D style).
defineVisuals({
  hook: {
    build(w) {
      p3Lights(w); w.add(p3Ground()); w.add(p3Runway()); w.add(p3Forest(26));
      const plane = w.add(p3Plane()); plane.position.y = 1.15;
      return (t) => {
        const a = p3Lerp(0.95, 0.6, (t - w.s.t0) / (w.s.t1 - w.s.t0));   // three-quarter view: the plane fits in vertical
        w.look([Math.cos(a) * 28, 4, Math.sin(a) * 28], [-0.7, 1.4, 0.3]);
        plane.scale.setScalar(1.35 * (1 - 0.03 * Math.sin(p3Clamp((t - 2.7) * 6) * Math.PI)));
      };
    },
  },
  wing: {
    build(w) {
      p3Lights(w); w.add(p3Ground()); w.add(p3Runway());
      const plane = w.add(p3Plane()); plane.position.y = 1.15; plane.scale.setScalar(1.35);
      return (t) => {
        const u = p3Ramp(t, w.s.t0, w.s.t0 + 1.4);
        w.look([p3Lerp(22, 15, u), p3Lerp(4, 12, u), p3Lerp(20, 21, u)], [p3Lerp(-0.7, 0.2, u), p3Lerp(1.4, 3.2, u), p3Lerp(0.3, 0.6, u)]);
        plane.glow(t > w.K('wing') ? 0.5 + 0.5 * Math.sin((t - w.K('wing')) * 6) : 0.5);
      };
    },
  },
  shape: {
    bg: C3.night,
    build(w) {
      p3Lights(w); w.look([0, 1.0, 15], [0, 0.4, 0]);
      const foil = w.add(p3Airfoil()), air = w.add(p3Airflow());
      return (t) => {
        foil.rotation.z = -0.16 * p3Ramp(t, w.K('tilted') - 0.2, w.K('tilted') + 0.5);
        foil.glow(t > w.K('curved') ? 0.5 + 0.3 * Math.sin((t - w.K('curved')) * 5) : 0);
        air.pose(t, w.K('pushes') - 0.6, 4, 1.6 * p3Ramp(t, w.K('down') - 0.8, w.K('down') + 0.6));
      };
    },
  },
  newton: {
    bg: C3.night,
    build(w) {
      p3Lights(w); w.look([0, 0.6, 21], [0, 1.1, 0]);
      const foil = w.add(p3Airfoil()); foil.rotation.z = -0.16;
      const air = w.add(p3Airflow());
      const downs = [-0.6, 0.5, 1.6].map((x) => w.add(p3Arrow([x, -0.5, 1.7], [0.2, -1, 0], 1.5, C3.air, 0.16)));
      const up = w.add(p3Arrow([-0.2, 0.6, 1.7], [0, 1, 0], 1.9, C3.yellow, 0.3));
      return (t) => {
        air.pose(t, w.s.t0 - 2, 4, 1.6);
        downs.forEach((a, i) => a.grow(p3Spring(t, w.K('down') + i * 0.08, 200, 18)));
        up.grow(p3Spring(t, w.K('up'), 180, 14));
        up.scale.setScalar(t > w.K('lift') ? 1 + 0.08 * Math.sin((t - w.K('lift')) * 9) : 1);
      };
    },
  },
  speed: {
    build(w) {
      p3Lights(w); w.add(p3Ground());
      const road = w.add(p3Runway()), trees = w.add(p3Forest(18, 7));
      const plane = w.add(p3Plane()); plane.scale.setScalar(1.25);
      const air = p3Airflow(); air.scale.setScalar(0.6); w.add(air);
      return (t) => {
        const advance = (t - w.s.t0) * 4 + Math.max(0, t - w.K('fast')) ** 2 * 6;
        const rise = p3Ramp(t, w.K('stat') - 0.1, w.K('stat') + 1.3), y = 1.15 + rise * 3.2;
        w.look([22, 3.5, 20], [0, 1.2 + rise * 3.2, 0]);
        road.advance(advance);
        trees.position.x = -(((advance * 0.5) % 60) + 60) % 60 + 30;
        plane.position.y = y; plane.rotation.z = 0.18 * p3Ramp(t, w.K('stat') - 0.3, w.K('stat') + 0.4);
        air.position.y = y; air.pose(t, w.K('fast') - 0.3, 6 + Math.max(0, t - w.K('fast')) * 4, 0.8);
      };
    },
  },
  closing: {
    bg: '#7fc0ef',
    build(w) {
      p3Lights(w);
      const spots = [[-6, 1, -16, 1.4], [8, 2, -24, 2.2], [2, -4, -12, 1.2], [-10, 3, -30, 2.6], [12, -3, -20, 1.6]];
      const clouds = spots.map(([, y, z, k]) => w.add(p3Cloud([0, y, z], k)));
      const plane = w.add(p3Plane()); plane.scale.setScalar(1.3);
      const air = p3Airflow(5, -0.6, 1.2, 2.4, '#ffffff'); air.position.set(-1.5, -0.6, 0); air.scale.setScalar(0.7); w.add(air);
      return (t) => {
        const lt = t - w.s.t0;
        w.look([18 + Math.sin(lt * 0.4) * 1.5, 5.5, 22.5], [0, 0.8, 0]);
        clouds.forEach((c, i) => { c.position.x = ((spots[i][0] + 30 - lt * 5 * (1 + i * 0.1)) % 44 + 44) % 44 - 22; });
        plane.position.y = Math.sin(lt * 1.3) * 0.25; plane.rotation.set(0.08 * Math.sin(lt), 0, 0.05);
        air.pose(t, w.K('pushing') - 0.4, 8, 2);
      };
    },
  },
});
