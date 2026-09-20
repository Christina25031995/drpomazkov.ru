(function(){
  if (customElements.get('ap5-figure')) return;

  const SRC = 'assets/figure-src.png';
  const ease = (t) => t<0?0:t>1?1:t*t*(3-2*t);

  class Ap5Figure extends HTMLElement {
    connectedCallback(){
      if (this._built) return;
      this._built = true;
      this.style.cssText = 'display:block; position:absolute; inset:0; width:100%; height:100%;';
      this.canvas = document.createElement('canvas');
      this.canvas.style.cssText = 'display:block; width:100%; height:100%;';
      this.appendChild(this.canvas);
      this.ctx = this.canvas.getContext('2d');
      this.w = 0; this.h = 0;
      this.t0 = performance.now();
      this._frame = (t, tok) => this.frame(t, tok);
      this._frames = 0; this._lastCount = -1;

      const img = new Image();
      img.onload = () => { this.img = img; this.w = 0; this.kick(); };
      img.src = SRC;

      this.kick();
      this._watch = setInterval(() => {
        if (!this.isConnected) return;
        if (this._frames === this._lastCount) this.kick();
        this._lastCount = this._frames;
      }, 500);
      this._vis = true;
      if (window.IntersectionObserver){
        this._io = new IntersectionObserver((es) => { this._vis = es[0].isIntersecting; }, { rootMargin: '120px' });
        this._io.observe(this);
      }
      this._onVis = () => { if (!document.hidden) this.kick(); };
      document.addEventListener('visibilitychange', this._onVis);
      window.addEventListener('load', this._onVis);
    }
    kick(){
      cancelAnimationFrame(this.raf);
      this._token = (this._token || 0) + 1;
      const tok = this._token;
      this.raf = requestAnimationFrame((t) => this._frame(t, tok));
    }
    disconnectedCallback(){
      cancelAnimationFrame(this.raf);
      clearInterval(this._watch);
      if (this._io) this._io.disconnect();
      document.removeEventListener('visibilitychange', this._onVis);
      window.removeEventListener('load', this._onVis);
    }

    build(w,h){
      try { this.buildInner(w,h); }
      catch(e){ this.pts = []; this._failed = true; }
    }

    buildInner(w,h){
      const img = this.img;
      if (!img) { this.pts = []; return; }

      // fit the source image into the host
      const ar = img.width / img.height;
      let figH = h*1.16, figW = figH*ar;
      if (figW > w*1.12){ figW = w*1.12; figH = figW/ar; }
      const ox = w*0.5 - figW*0.5, oy = h*0.5 - figH*0.5;
      this.geom = { ox, oy, figW, figH, cx: w*0.5, cy: h*0.5 };

      // sample luminous pixels of the source
      const SW = 220, SH = Math.round(SW/ar);
      const off = document.createElement('canvas');
      off.width = SW; off.height = SH;
      const oc = off.getContext('2d', { willReadFrequently: true });
      oc.drawImage(img, 0, 0, SW, SH);
      const data = oc.getImageData(0,0,SW,SH).data;

      // estimate the source's own background level so its rectangle never shows
      const lumAt = (i) => (data[i]*0.35 + data[i+1]*0.45 + data[i+2]*0.2) / 255;
      let bg = 0, bgN = 0;
      for (let y=0;y<SH;y+=3){
        for (let x=0;x<SW;x+=3){
          const edge = x < SW*0.08 || x > SW*0.92 || y < SH*0.05 || y > SH*0.95;
          if (!edge) continue;
          bg += lumAt((y*SW+x)*4); bgN++;
        }
      }
      bg = bgN ? bg/bgN : 0;
      const cut = Math.min(0.35, bg + 0.03);
      const span = Math.max(0.15, 1 - cut);

      const target = Math.round(Math.min(7000, Math.max(3000, (w*h)/95)));
      const pts = [];
      let guard = 0;
      while (pts.length < target && guard < target*10){
        guard++;
        const sx = (Math.random()*SW)|0, sy = (Math.random()*SH)|0;
        const i = (sy*SW + sx)*4;
        const raw = lumAt(i);
        if (raw < cut) continue;
        const lum = Math.min(1, (raw - cut) / span);
        if (lum < 0.05) continue;
        if (Math.random() > Math.pow(lum, 0.45)) continue;

        const u = sx/SW, v = sy/SH;
        const tx = ox + u*figW;
        const ty = oy + v*figH;
        const ang = Math.random()*Math.PI*2;
        const rad = (0.35 + Math.random()*1.25) * figW;

        pts.push({
          tx, ty, u, v, lum,
          spin: (0.25 + Math.random()*0.8)*(Math.random()<0.5?-1:1),
          sx: this.geom.cx + Math.cos(ang)*rad,
          sy: this.geom.cy + Math.sin(ang)*rad*0.85,
          ph: Math.random(),
          delay: 0.34*Math.random() + 0.2*v,
          out: 0.2*Math.random() + 0.34*Math.pow(1-u,1.4)*Math.random(),
          size: (0.3 + Math.random()*0.75) * (0.7 + lum*0.7),
          warm: lum,
          drift: 0.25 + Math.random()*1.5,
          tw: 0.4 + Math.random()*1.4
        });
      }
      this.pts = pts;
    }

    sync(){
      const cw = this.clientWidth, ch = this.clientHeight;
      if (!cw || !ch) return false;
      if (cw === this.w && ch === this.h && this.pts) return true;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      this.canvas.width = Math.round(cw*dpr);
      this.canvas.height = Math.round(ch*dpr);
      this.w = cw; this.h = ch;
      this.ctx.setTransform(dpr,0,0,dpr,0,0);
      this.build(cw, ch);
      return true;
    }

    frame(now, tok){
      if (tok !== this._token) return;   // only one loop may ever run
      this._frames++;
      this.raf = requestAnimationFrame((t) => this.frame(t, tok));
      if (document.hidden) return;
      if (this._vis === false && this.clientWidth && this.clientHeight && this.pts) return;
      if (now - (this._last || 0) < 40) return;
      this._last = now;
      if (!this.sync()) return;
      const ctx = this.ctx, w = this.w, h = this.h, g = this.geom;
      if (!this.pts || !this.pts.length){ ctx.clearRect(0,0,w,h); return; }

      const time = (now - this.t0)/1000;
      const LOOP = 11;
      const p = (time % LOOP) / LOOP;
      const grow = ease(p/0.34);
      const fall = ease((p-0.68)/0.32);
      const breathe = 1 + Math.sin(time*0.45)*0.01;

      ctx.clearRect(0,0,w,h);

      if (!this._hzBase){
        const b = ctx.createRadialGradient(g.cx, g.cy, 0, g.cx, g.cy, Math.min(w,h)*0.42);
        this._hzBase = b;
      }
      const hz = ctx.createRadialGradient(g.cx, g.cy, 0, g.cx, g.cy, Math.min(w,h)*0.42);
      const ha = (0.035 + 0.055*grow) * (1 - fall*0.85);
      hz.addColorStop(0, 'rgba(236,214,180,'+ha.toFixed(3)+')');
      hz.addColorStop(0.5, 'rgba(172,130,80,'+(ha*0.45).toFixed(3)+')');
      hz.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = hz;
      ctx.fillRect(0,0,w,h);

      ctx.globalCompositeOperation = 'lighter';

      for (let i=0;i<this.pts.length;i++){
        const q = this.pts[i];
        let k = ease((grow - q.delay) / Math.max(0.14, 1 - q.delay));
        const d = ease((fall - q.out) / 0.7);
        k = k * (1-d);
        if (k <= 0.004) continue;

        const bx = g.cx + (q.tx - g.cx)*breathe;
        const by = g.cy + (q.ty - g.cy)*breathe;

        const swirl = (1-k) * q.spin * 1.2;
        const dx = bx - q.sx, dy = by - q.sy;
        const cs = Math.cos(swirl), sn = Math.sin(swirl);
        const px = q.sx + (dx*cs - dy*sn)*k;
        const py = q.sy + (dx*sn + dy*cs)*k;

        const wob = (1-k)*12*q.drift;
        const x = px + Math.sin(time*0.5 + q.ph*9)*wob + Math.sin(time*0.85 + q.ph*23)*k*1.1;
        const y = py + Math.cos(time*0.44 + q.ph*7)*wob + Math.cos(time*0.7 + q.ph*19)*k*0.9;

        const twinkle = 0.75 + 0.25*Math.sin(time*q.tw + q.ph*13);
        const alpha = (0.42 + q.lum*0.85) * (0.24 + 0.76*k) * twinkle * (1 - d*0.9);
        ctx.fillStyle = q.warm > 0.55
          ? 'rgba(246,232,208,'+alpha.toFixed(3)+')'
          : 'rgba(196,152,100,'+alpha.toFixed(3)+')';
        const r = q.size*(0.9+0.7*k);
        ctx.fillRect(x-r, y-r, r*2, r*2);
      }

      // soft vignette so nothing is cut off by the canvas edges
      ctx.globalCompositeOperation = 'destination-out';
      const vg = ctx.createRadialGradient(w*0.5, h*0.5, Math.min(w,h)*0.34, w*0.5, h*0.5, Math.max(w,h)*0.72);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(0.7, 'rgba(0,0,0,0.25)');
      vg.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.fillStyle = vg;
      ctx.fillRect(0,0,w,h);

      ctx.globalCompositeOperation = 'source-over';
    }
  }

  customElements.define('ap5-figure', Ap5Figure);
})();
