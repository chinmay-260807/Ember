
class AudioService {
  private context: AudioContext | null = null;
  private ambientNodes: {
    source: AudioNode | null;
    filter: BiquadFilterNode | null;
    gain: GainNode | null;
    timer?: number;
  } = { source: null, filter: null, gain: null };

  private initContext() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  private createOscillator(freq: number, type: OscillatorType, startTime: number, duration: number, volume: number) {
    if (!this.context) return;
    
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.context.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  playQuote() {
    this.initContext();
    const now = this.context!.currentTime;
    this.createOscillator(440, 'sine', now, 1.5, 0.1); 
  }

  playCompliment() {
    this.initContext();
    const now = this.context!.currentTime;
    this.createOscillator(523.25, 'sine', now, 1.2, 0.08); 
    this.createOscillator(659.25, 'sine', now + 0.1, 1.5, 0.06); 
  }

  playCompletion() {
    this.initContext();
    const now = this.context!.currentTime;
    this.createOscillator(261.63, 'sine', now, 2.5, 0.1); 
    this.createOscillator(329.63, 'sine', now + 0.1, 2.5, 0.08); 
    this.createOscillator(392.00, 'sine', now + 0.2, 2.5, 0.06); 
    this.createOscillator(523.25, 'sine', now + 0.3, 3.0, 0.04); 
  }

  playUndo() {
    this.initContext();
    const now = this.context!.currentTime;
    this.createOscillator(220, 'sine', now, 0.4, 0.05); 
  }

  playProgress() {
    this.initContext();
    const now = this.context!.currentTime;
    this.createOscillator(880, 'sine', now, 0.3, 0.03); 
  }

  // --- Ambient Sound Synthesis ---

  stopAmbient() {
    if (this.ambientNodes.gain) {
      const now = this.context?.currentTime || 0;
      this.ambientNodes.gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      setTimeout(() => {
        if (this.ambientNodes.source) {
          (this.ambientNodes.source as any).stop?.();
          this.ambientNodes.source.disconnect();
        }
        if (this.ambientNodes.timer) {
          window.clearInterval(this.ambientNodes.timer);
        }
        this.ambientNodes = { source: null, filter: null, gain: null };
      }, 1600);
    }
  }

  startAmbient(type: 'rain' | 'wind' | 'chimes') {
    this.initContext();
    this.stopAmbient();

    const ctx = this.context!;
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 2);
    gainNode.connect(ctx.destination);
    this.ambientNodes.gain = gainNode;

    if (type === 'chimes') {
      const frequencies = [523.25, 659.25, 783.99, 987.77, 1046.50]; // C Pentatonic
      this.ambientNodes.timer = window.setInterval(() => {
        const freq = frequencies[Math.floor(Math.random() * frequencies.length)];
        const startTime = ctx.currentTime;
        const duration = 4 + Math.random() * 4;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        g.gain.setValueAtTime(0, startTime);
        g.gain.linearRampToValueAtTime(0.02, startTime + 1);
        g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(g);
        g.connect(gainNode);
        osc.start(startTime);
        osc.stop(startTime + duration);
      }, 3000);
      return;
    }

    // Noise-based sounds
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    
    // Generate Pink/Brownish noise
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'wind') {
        // Brownian noise (approximate)
        lastOut = (lastOut + (0.02 * white)) / 1.02;
        output[i] = lastOut * 3.5;
      } else {
        // Pink noise (approximate)
        lastOut = (lastOut + (0.1 * white)) / 1.1;
        output[i] = lastOut * 1.5;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    
    if (type === 'wind') {
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      filter.Q.setValueAtTime(5, ctx.currentTime);
      // LFO for wind gusting
      this.ambientNodes.timer = window.setInterval(() => {
        const targetFreq = 200 + Math.random() * 800;
        filter.frequency.exponentialRampToValueAtTime(targetFreq, ctx.currentTime + 3);
      }, 4000);
    } else {
      // Rain
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
    }

    source.connect(filter);
    filter.connect(gainNode);
    source.start();
    this.ambientNodes.source = source;
    this.ambientNodes.filter = filter;
  }
}

export const audioService = new AudioService();
