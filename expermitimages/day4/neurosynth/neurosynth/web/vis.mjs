const dataStreams = ["neurosynth_beat", "neurosynth_cycle", "cl_spikes", "cl_stims"];

function createVisualiser(uniqueId, div) {

    // ============================================================
    // CONSTANTS
    // ============================================================
    const FORBIDDEN = new Set([0, 4, 7, 56, 63]);
    const SENSORY = new Set();
    const MOTOR = new Set();
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const ch = r * 8 + c;
            if (FORBIDDEN.has(ch)) continue;
            if (c < 4) SENSORY.add(ch);
            else MOTOR.add(ch);
        }
    }

    const CHANNEL_REGION = {};
    for (let i = 0; i < 64; i++) {
        if (FORBIDDEN.has(i)) CHANNEL_REGION[i] = 'forbidden';
        else if (i % 8 < 4) CHANNEL_REGION[i] = 'sensory';
        else CHANNEL_REGION[i] = 'motor';
    }

    // Spike intensity color gradient (6 steps)
    const SPIKE_COLORS = [];
    for (let i = 0; i <= 5; i++) {
        const ratio = i / 5;
        const r = Math.round((1 - ratio) * 240 + ratio * 255);
        const g = Math.round((1 - ratio) * 230 + ratio * 152);
        const b = Math.round((1 - ratio) * 140 + ratio * 79);
        SPIKE_COLORS.push(`rgb(${r},${g},${b})`);
    }

    // ============================================================
    // DOM ELEMENTS
    // ============================================================
    const circleCanvas = div.querySelector('#circleCanvas');
    const meaCanvas = div.querySelector('#meaCanvas');
    const learningCanvas = div.querySelector('#learningCanvas');
    const rasterCanvas = div.querySelector('#rasterCanvas');
    const rasterTooltip = div.querySelector('#rasterTooltip');

    const circleCtx = circleCanvas.getContext('2d');
    const meaCtx = meaCanvas.getContext('2d');
    const learningCtx = learningCanvas.getContext('2d');
    const rasterCtx = rasterCanvas.getContext('2d');

    const statCycles = div.querySelector('#statCycles');
    const statMatches = div.querySelector('#statMatches');
    const statRate = div.querySelector('#statRate');
    const statLastMatch = div.querySelector('#statLastMatch');
    const cycleGrid = div.querySelector('#cycleGrid');
    const patternDisplay = div.querySelector('#patternDisplay');
    const cycleResult = div.querySelector('#cycleResult');

    // Audio control elements
    const btnMute = div.querySelector('#btnMute');
    const audioVolume = div.querySelector('#audioVolume');
    const audBeats = div.querySelector('#audBeats');
    const audRhythm = div.querySelector('#audRhythm');
    const audFeedback = div.querySelector('#audFeedback');

    // Learning stats elements
    const statOverall = div.querySelector('#statOverall');
    const statHamming = div.querySelector('#statHamming');
    const statDominant = div.querySelector('#statDominant');
    const kDistDisplay = div.querySelector('#kDistDisplay');
    const cycleHistory = div.querySelector('#cycleHistory');

    // FEP feedback elements
    const fepFeedback = div.querySelector('#fepFeedback');
    const patternCompare = div.querySelector('#patternCompare');
    const feedbackLog = div.querySelector('#feedbackLog');

    // ============================================================
    // STATE
    // ============================================================
    const meaSpikes = new Float64Array(64);
    const meaStims = new Float64Array(64);
    const spikeCounts = new Uint16Array(64);
    const spikeDecay = new Uint8Array(64);

    const RASTER_COLS = 500;
    const rasterSpikes = new Float32Array(64 * RASTER_COLS);
    const rasterStims = new Float32Array(64 * RASTER_COLS);
    let rasterCol = 0;
    const rasterBeatBounds = [];

    let cycleLength = 8;
    let currentPattern = [];
    let lastPattern = null;
    let lastResult = null;
    let matchRateHistory = [];
    const baseline = 0.172;

    let animationFrameId = null;

    // DPR scaling state
    let dpr = window.devicePixelRatio || 1;
    let lastDpr = 0;

    // Console logging spike counter
    let spikeLogCounter = 0;
    let spikeLogAccum = 0;

    // Learning tracking state
    const kDistribution = {};       // k -> count
    const patternCounts = {};       // "E(3,8)" -> count
    const hammingHistory = [];      // array of hamming distances for misses
    const cycleRecords = [];        // last 20 cycle records for history display
    let totalCycles = 0;
    let totalMatches = 0;
    const feedbackRecords = [];     // last 20 feedback details

    // ============================================================
    // DPR CANVAS SCALING
    // ============================================================
    function setupCanvas(canvas, ctx, logicalW, logicalH) {
        const tw = Math.round(logicalW * dpr);
        const th = Math.round(logicalH * dpr);
        if (canvas.width !== tw || canvas.height !== th) {
            canvas.width = tw;
            canvas.height = th;
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return { w: logicalW, h: logicalH };
    }

    function getCanvasLogicalSize(canvas, aspectRatio) {
        const container = canvas.parentElement;
        const rect = container.getBoundingClientRect();
        const w = rect.width || 400;
        const h = aspectRatio ? w / aspectRatio : (canvas.getAttribute('height') / canvas.getAttribute('width')) * w;
        return { w, h };
    }

    // ============================================================
    // AUDIO ENGINE
    // ============================================================
    let audioCtx = null, masterGain = null, muted = false;
    let rhythmBus = null, learningBus = null, feedbackBus = null;
    let mainFilter = null, delayNode = null, delayFeedback = null, delayWet = null, delayDry = null;
    let audioInitialized = false;
    let smoothedMatchRate = 0;

    const audioSettings = {
        masterVol: 0.25,
        beatSounds: true,
        rhythmPlayback: true,
        feedbackAudio: true,
    };

    const PENTA = [220, 247.5, 275, 330, 366.7];

    function orgToPitch(org) {
        const idx = org * (PENTA.length - 1);
        const lo = Math.floor(idx);
        const hi = Math.min(lo + 1, PENTA.length - 1);
        const frac = idx - lo;
        return PENTA[lo] * (1 - frac) + PENTA[hi] * frac;
    }

    function initAudio() {
        if (audioCtx) return;
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        masterGain = audioCtx.createGain();
        masterGain.gain.value = audioSettings.masterVol;
        masterGain.connect(audioCtx.destination);

        mainFilter = audioCtx.createBiquadFilter();
        mainFilter.type = 'lowpass';
        mainFilter.frequency.value = 800;
        mainFilter.Q.value = 0.7;
        mainFilter.connect(masterGain);

        delayNode = audioCtx.createDelay(1.0);
        delayFeedback = audioCtx.createGain();
        delayFeedback.gain.value = 0.0;
        delayWet = audioCtx.createGain();
        delayWet.gain.value = 0.0;
        delayDry = audioCtx.createGain();
        delayDry.gain.value = 1.0;
        delayNode.delayTime.value = 0.188;

        delayNode.connect(delayWet);
        delayNode.connect(delayFeedback);
        delayFeedback.connect(delayNode);
        delayWet.connect(mainFilter);
        delayDry.connect(mainFilter);

        rhythmBus = audioCtx.createGain();
        rhythmBus.gain.value = 0.5;
        rhythmBus.connect(delayDry);
        rhythmBus.connect(delayNode);

        learningBus = audioCtx.createGain();
        learningBus.gain.value = 0.4;
        learningBus.connect(delayDry);
        learningBus.connect(delayNode);

        feedbackBus = audioCtx.createGain();
        feedbackBus.gain.value = 0.6;
        feedbackBus.connect(delayDry);
        feedbackBus.connect(delayNode);

        console.log('[neurosynth] Audio initialized');
    }

    function ensureAudio() {
        if (audioInitialized) return;
        audioInitialized = true;
        initAudio();
    }

    function playSound(freq, type, vol, dur, bus) {
        if (!audioCtx || muted) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const dest = bus || learningBus;
        const osc = audioCtx.createOscillator();
        const env = audioCtx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        env.gain.setValueAtTime(vol, audioCtx.currentTime);
        env.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
        osc.connect(env);
        env.connect(dest);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + dur + 0.02);
    }

    function playBeatFire() {
        if (!audioSettings.beatSounds) return;
        const org = smoothedMatchRate;
        const freq = orgToPitch(org);
        playSound(freq, 'triangle', 0.12, 0.12, learningBus);
        if (org > 0.1) {
            playSound(freq * 2, 'sine', org * 0.04, 0.1, learningBus);
        }
    }

    function playBeatSilent() {
        if (!audioSettings.beatSounds) return;
        playSound(800, 'sine', 0.015, 0.015, learningBus);
    }

    function playEuclideanMatch(result) {
        if (!audioSettings.feedbackAudio) return;
        const org = smoothedMatchRate;
        const root = 440 + org * 220;
        const freqs = [root, root * 5 / 4, root * 3 / 2];
        const vols = [0.07, 0.05, 0.035];
        if (org > 0.3) { freqs.push(root * 2); vols.push(org * 0.02); }
        const stagger = 60 + (1 - org) * 40;
        for (let i = 0; i < freqs.length; i++) {
            ((f, v, delay) => {
                setTimeout(() => playSound(f, 'sine', v, 0.12 + org * 0.08, feedbackBus), delay);
            })(freqs[i], vols[i], i * stagger);
        }
    }

    function playMiss(result) {
        if (!audioSettings.feedbackAudio || !result) return;
        const hamming = result.min_hamming || 1;
        const n = cycleLength;
        const dissonance = hamming / n;
        const baseFreq = 220 - dissonance * 80;
        const intervals = [3 / 2, 3 / 2, 7 / 5, 7 / 6, 32 / 27, 16 / 15, 25 / 24, 128 / 125, 81 / 80];
        const ratio = intervals[Math.min(hamming, intervals.length - 1)];
        const dur = 0.15 + dissonance * 0.15;
        const waveform = dissonance < 0.4 ? 'triangle' : 'sawtooth';
        playSound(baseFreq, waveform, 0.06, dur, feedbackBus);
        playSound(baseFreq * ratio, waveform, 0.042, dur, feedbackBus);
        if (hamming >= 4) {
            playSound(baseFreq * 1.01, 'sawtooth', dissonance * 0.02, dur * 0.7, feedbackBus);
        }
    }

    function playRhythm(pattern, bpm) {
        if (!audioSettings.rhythmPlayback || !audioCtx || muted) return;
        const beatMs = 60000 / bpm;
        const org = smoothedMatchRate;
        const freq = orgToPitch(org);
        const noteDur = (60 / bpm) * 0.3;
        for (let i = 0; i < pattern.length; i++) {
            ((step, fire) => {
                setTimeout(() => {
                    if (fire) playSound(freq, 'triangle', 0.1, noteDur, rhythmBus);
                    else playSound(freq * 2, 'sine', 0.006, 0.03, rhythmBus);
                }, step * beatMs * 0.5);
            })(i, pattern[i] === 1);
        }
    }

    function updateLearningAudio() {
        if (!audioCtx) return;
        const mr = smoothedMatchRate;
        if (mainFilter) {
            mainFilter.frequency.setTargetAtTime(800 + mr * 5200, audioCtx.currentTime, 1.0);
        }
        if (delayWet) {
            delayWet.gain.setTargetAtTime(mr * 0.25, audioCtx.currentTime, 0.5);
            delayFeedback.gain.setTargetAtTime(mr * 0.4, audioCtx.currentTime, 0.5);
        }
    }

    // Audio control wiring
    div.addEventListener('click', ensureAudio, { once: true });
    div.addEventListener('touchstart', ensureAudio, { once: true });

    if (btnMute) btnMute.addEventListener('click', () => {
        ensureAudio();
        muted = !muted;
        btnMute.textContent = muted ? 'Unmute' : 'Mute';
        btnMute.classList.toggle('active', muted);
        if (audioCtx) { if (muted) audioCtx.suspend(); else audioCtx.resume(); }
    });
    if (audioVolume) audioVolume.addEventListener('input', (e) => {
        ensureAudio();
        audioSettings.masterVol = e.target.value / 100;
        if (masterGain) masterGain.gain.setTargetAtTime(audioSettings.masterVol, audioCtx.currentTime, 0.1);
    });
    if (audBeats) audBeats.addEventListener('change', (e) => { audioSettings.beatSounds = e.target.checked; });
    if (audRhythm) audRhythm.addEventListener('change', (e) => { audioSettings.rhythmPlayback = e.target.checked; });
    if (audFeedback) audFeedback.addEventListener('change', (e) => { audioSettings.feedbackAudio = e.target.checked; });

    // ============================================================
    // EUCLIDEAN ALGORITHMS
    // ============================================================
    function euclidean(k, n) {
        if (k >= n) return Array(n).fill(1);
        if (k <= 0) return Array(n).fill(0);
        let pattern = [];
        for (let i = 0; i < n; i++) pattern.push(i < k ? [1] : [0]);
        for (let lvl = 0; lvl < 30; lvl++) {
            const types = [...new Set(pattern.map(p => p.join(',')))];
            if (types.length < 2) break;
            let major = pattern.filter(p => p.join(',') === types[0]);
            let minor = pattern.filter(p => p.join(',') === types[1]);
            if (minor.length > major.length) [major, minor] = [minor, major];
            const ml = Math.min(major.length, minor.length);
            const np = [];
            for (let i = 0; i < ml; i++) np.push(major[i].concat(minor[i]));
            for (let i = ml; i < major.length; i++) np.push(major[i]);
            for (let i = ml; i < minor.length; i++) np.push(minor[i]);
            pattern = np;
        }
        return pattern.flat();
    }

    // ============================================================
    // CYCLE GRID
    // ============================================================
    function buildCycleGrid(n) {
        let html = '';
        for (let i = 0; i < n; i++) {
            html += `<div class="cycle-cell" id="ccell-${uniqueId}-${i}">` +
                `<span class="spike-ct" style="color:#666;">-</span>` +
                `<span class="decision" style="color:#555;">?</span></div>`;
        }
        cycleGrid.innerHTML = html;
    }

    function updateCycleCell(idx, spikes, fire) {
        const cell = div.querySelector(`#ccell-${uniqueId}-${idx}`);
        if (!cell) return;
        cell.style.background = fire ? 'rgba(76,175,80,0.2)' : 'rgba(20,20,30,0.5)';
        cell.style.borderColor = fire ? '#4caf50' : '#333355';
        cell.querySelector('.spike-ct').textContent = spikes;
        cell.querySelector('.spike-ct').style.color = fire ? '#4caf50' : '#888';
        cell.querySelector('.decision').textContent = fire ? 'FIRE' : 'silent';
        cell.querySelector('.decision').style.color = fire ? '#4caf50' : '#666';
    }

    // ============================================================
    // DRAWING: MEA Grid
    // ============================================================
    function drawMEA() {
        const { w: W, h: H } = getCanvasLogicalSize(meaCanvas, 1);
        setupCanvas(meaCanvas, meaCtx, W, H);

        const cW = W / 8, cH = H / 8;
        meaCtx.fillStyle = '#0b0910';
        meaCtx.fillRect(0, 0, W, H);

        // Divider
        meaCtx.strokeStyle = 'rgba(94,86,114,0.5)';
        meaCtx.lineWidth = 1.5;
        meaCtx.setLineDash([4, 4]);
        meaCtx.beginPath(); meaCtx.moveTo(W / 2, 0); meaCtx.lineTo(W / 2, H); meaCtx.stroke();
        meaCtx.setLineDash([]);

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const ch = r * 8 + c, x = c * cW, y = r * cH;
                const region = CHANNEL_REGION[ch];
                meaCtx.fillStyle = region === 'forbidden' ? '#0e0e0e' : region === 'sensory' ? '#1a1030' : '#0a1a28';
                meaCtx.fillRect(x + 1, y + 1, cW - 2, cH - 2);

                if (meaSpikes[ch] > 0.05) {
                    const colorIdx = Math.min(spikeCounts[ch], 5);
                    meaCtx.globalAlpha = meaSpikes[ch] * 0.8;
                    meaCtx.fillStyle = SPIKE_COLORS[colorIdx];
                    meaCtx.fillRect(x + 1, y + 1, cW - 2, cH - 2);
                    meaCtx.globalAlpha = 1;
                }
                if (meaStims[ch] > 0.05) {
                    meaCtx.fillStyle = `rgba(196,106,235,${meaStims[ch] * 0.8})`;
                    meaCtx.fillRect(x + 1, y + 1, cW - 2, cH - 2);
                }

                meaCtx.font = '9px monospace';
                meaCtx.fillStyle = region === 'forbidden' ? '#333' : '#666';
                meaCtx.textAlign = 'center';
                meaCtx.textBaseline = 'middle';
                meaCtx.fillText(ch, x + cW / 2, y + cH / 2);
            }
        }
    }

    // ============================================================
    // DRAWING: Circular Rhythm
    // ============================================================
    function drawCircle() {
        const { w: W, h: H } = getCanvasLogicalSize(circleCanvas, 1);
        setupCanvas(circleCanvas, circleCtx, W, H);

        const cx = W / 2, cy = H / 2, R = Math.max(10, Math.min(W, H) / 2 - 40);
        circleCtx.fillStyle = '#0b0910';
        circleCtx.fillRect(0, 0, W, H);

        // Circle outline
        circleCtx.strokeStyle = 'rgba(94,86,114,0.5)';
        circleCtx.lineWidth = 1.5;
        circleCtx.beginPath(); circleCtx.arc(cx, cy, R, 0, Math.PI * 2); circleCtx.stroke();

        const n = cycleLength;
        const positions = [];
        for (let i = 0; i < n; i++) {
            const a = (2 * Math.PI * i / n) - Math.PI / 2;
            positions.push({ x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) });
        }

        const pattern = currentPattern.length > 0 ? currentPattern : lastPattern;
        const result = currentPattern.length > 0 ? null : lastResult;

        // Ghost Euclidean overlay for misses
        if (result && !result.match && pattern && pattern.length === n) {
            const ghost = euclidean(result.k, n);
            circleCtx.globalAlpha = 0.2;
            const ghostFires = [];
            for (let i = 0; i < n; i++) if (ghost[i]) ghostFires.push(i);
            if (ghostFires.length > 1) {
                circleCtx.strokeStyle = '#4caf50'; circleCtx.lineWidth = 1.5;
                circleCtx.beginPath();
                ghostFires.forEach((fi, idx) => {
                    const p = positions[fi];
                    idx === 0 ? circleCtx.moveTo(p.x, p.y) : circleCtx.lineTo(p.x, p.y);
                });
                circleCtx.closePath(); circleCtx.stroke();
            }
            for (let i = 0; i < n; i++) {
                if (ghost[i]) {
                    circleCtx.fillStyle = '#4caf50';
                    circleCtx.beginPath(); circleCtx.arc(positions[i].x, positions[i].y, 8, 0, Math.PI * 2); circleCtx.fill();
                }
            }
            circleCtx.globalAlpha = 1;
        }

        if (pattern) {
            // Connect FIRE beats
            const fires = [];
            for (let i = 0; i < pattern.length; i++) if (pattern[i]) fires.push(i);
            if (fires.length > 1) {
                const isMatch = result && result.match;
                circleCtx.strokeStyle = isMatch ? '#4caf50' : '#e85338';
                circleCtx.lineWidth = 2.5; circleCtx.globalAlpha = 0.6;
                circleCtx.beginPath();
                fires.forEach((fi, idx) => {
                    const p = positions[fi];
                    idx === 0 ? circleCtx.moveTo(p.x, p.y) : circleCtx.lineTo(p.x, p.y);
                });
                circleCtx.closePath(); circleCtx.stroke();
                circleCtx.globalAlpha = 1;
            }

            // Beat dots
            for (let i = 0; i < Math.min(pattern.length, n); i++) {
                const p = positions[i];
                if (pattern[i]) {
                    const isM = result && result.match;
                    circleCtx.fillStyle = isM ? '#4caf50' : '#e8a838';
                    circleCtx.beginPath(); circleCtx.arc(p.x, p.y, 10, 0, Math.PI * 2); circleCtx.fill();
                    circleCtx.globalAlpha = 0.25;
                    circleCtx.beginPath(); circleCtx.arc(p.x, p.y, 16, 0, Math.PI * 2); circleCtx.fill();
                    circleCtx.globalAlpha = 1;
                } else {
                    circleCtx.strokeStyle = '#666'; circleCtx.lineWidth = 2;
                    circleCtx.beginPath(); circleCtx.arc(p.x, p.y, 6, 0, Math.PI * 2); circleCtx.stroke();
                }
            }
            // Pending positions
            for (let i = pattern.length; i < n; i++) {
                circleCtx.strokeStyle = '#555'; circleCtx.lineWidth = 1.5;
                circleCtx.beginPath(); circleCtx.arc(positions[i].x, positions[i].y, 4, 0, Math.PI * 2); circleCtx.stroke();
            }
        } else {
            for (let i = 0; i < n; i++) {
                circleCtx.strokeStyle = '#555'; circleCtx.lineWidth = 1.5;
                circleCtx.beginPath(); circleCtx.arc(positions[i].x, positions[i].y, 4, 0, Math.PI * 2); circleCtx.stroke();
            }
        }

        // Beat labels
        circleCtx.font = '10px monospace'; circleCtx.fillStyle = '#888';
        circleCtx.textAlign = 'center'; circleCtx.textBaseline = 'middle';
        for (let i = 0; i < n; i++) {
            const a = (2 * Math.PI * i / n) - Math.PI / 2;
            circleCtx.fillText(i + 1, cx + (R + 22) * Math.cos(a), cy + (R + 22) * Math.sin(a));
        }

        // Center label
        if (result) {
            circleCtx.font = '13px monospace';
            circleCtx.fillStyle = result.match ? '#4caf50' : '#e85338';
            circleCtx.fillText(result.match ? result.label : `k=${result.k} H=${result.min_hamming}`, cx, cy - 6);
            circleCtx.font = '10px monospace'; circleCtx.fillStyle = '#888';
            circleCtx.fillText(result.match ? 'EUCLIDEAN' : 'NOT EUCLIDEAN', cx, cy + 10);
        }
    }

    // ============================================================
    // DRAWING: Raster Plot
    // ============================================================
    function drawRaster() {
        const { w: W, h: H } = getCanvasLogicalSize(rasterCanvas, 900 / 260);
        setupCanvas(rasterCanvas, rasterCtx, W, H);

        rasterCtx.fillStyle = '#0b0910';
        rasterCtx.fillRect(0, 0, W, H);

        const rowH = H / 64, colW = W / RASTER_COLS;
        const cur = rasterCol % RASTER_COLS;

        for (let ch = 0; ch < 64; ch++) {
            const y = ch * rowH;
            for (let c = 0; c < RASTER_COLS; c++) {
                const dc = (cur - RASTER_COLS + c + RASTER_COLS * 2) % RASTER_COLS;
                if (rasterSpikes[ch * RASTER_COLS + dc] > 0) {
                    rasterCtx.fillStyle = MOTOR.has(ch) ? '#f0e68c' : '#bbb';
                    rasterCtx.fillRect(c * colW, y, Math.max(colW, 1.2), Math.max(rowH * 0.7, 1));
                }
                if (rasterStims[ch * RASTER_COLS + dc] > 0) {
                    rasterCtx.fillStyle = 'rgba(56,232,198,0.6)';
                    rasterCtx.fillRect(c * colW, y, Math.max(colW, 1.2), Math.max(rowH * 0.7, 1));
                }
            }
        }

        // Beat boundaries
        rasterCtx.strokeStyle = 'rgba(232,168,56,0.35)'; rasterCtx.lineWidth = 1;
        rasterCtx.setLineDash([2, 3]);
        for (const bc of rasterBeatBounds) {
            const sc = (bc - (cur - RASTER_COLS) + RASTER_COLS * 2) % RASTER_COLS;
            if (sc >= 0 && sc < RASTER_COLS) {
                rasterCtx.beginPath(); rasterCtx.moveTo(sc * colW, 0); rasterCtx.lineTo(sc * colW, H); rasterCtx.stroke();
            }
        }
        rasterCtx.setLineDash([]);
    }

    // ============================================================
    // DRAWING: Learning Curve
    // ============================================================
    function drawLearning() {
        const { w: W, h: H } = getCanvasLogicalSize(learningCanvas, 900 / 200);
        setupCanvas(learningCanvas, learningCtx, W, H);

        learningCtx.fillStyle = '#0b0910';
        learningCtx.fillRect(0, 0, W, H);

        const margin = { top: 10, right: 10, bottom: 20, left: 36 };
        const pW = W - margin.left - margin.right;
        const pH = H - margin.top - margin.bottom;

        // Grid
        learningCtx.strokeStyle = 'rgba(60,50,90,0.5)'; learningCtx.lineWidth = 0.5;
        for (let pct = 0; pct <= 100; pct += 25) {
            const y = margin.top + pH - (pct / 100) * pH;
            learningCtx.beginPath(); learningCtx.moveTo(margin.left, y); learningCtx.lineTo(W - margin.right, y); learningCtx.stroke();
            learningCtx.font = '8px monospace'; learningCtx.fillStyle = '#777'; learningCtx.textAlign = 'right';
            learningCtx.fillText(pct + '%', margin.left - 3, y + 3);
        }

        // Baseline
        const blY = margin.top + pH - baseline * pH;
        learningCtx.strokeStyle = 'rgba(232,83,56,0.5)'; learningCtx.lineWidth = 1;
        learningCtx.setLineDash([3, 3]);
        learningCtx.beginPath(); learningCtx.moveTo(margin.left, blY); learningCtx.lineTo(W - margin.right, blY); learningCtx.stroke();
        learningCtx.setLineDash([]);
        learningCtx.font = '8px monospace'; learningCtx.fillStyle = 'rgba(232,83,56,0.7)'; learningCtx.textAlign = 'left';
        learningCtx.fillText(`chance (${Math.round(baseline * 100)}%)`, W - margin.right - 80, blY - 4);

        if (matchRateHistory.length < 2) {
            learningCtx.font = '11px monospace'; learningCtx.fillStyle = '#777'; learningCtx.textAlign = 'center';
            learningCtx.fillText('Waiting for data...', W / 2, H / 2);
            return;
        }

        const maxPts = Math.max(matchRateHistory.length, 20);
        const stepX = pW / Math.max(maxPts - 1, 1);

        // Dots per cycle (match = green, miss = red)
        for (let i = 0; i < matchRateHistory.length; i++) {
            const x = margin.left + i * stepX;
            const y = margin.top + pH - matchRateHistory[i] * pH;
            learningCtx.fillStyle = matchRateHistory[i] > baseline ? '#4caf50' : '#e85338';
            learningCtx.globalAlpha = 0.4;
            learningCtx.beginPath(); learningCtx.arc(x, y, 2.5, 0, Math.PI * 2); learningCtx.fill();
            learningCtx.globalAlpha = 1;
        }

        // Line
        learningCtx.strokeStyle = '#e8a838'; learningCtx.lineWidth = 1.8;
        learningCtx.beginPath();
        matchRateHistory.forEach((v, i) => {
            const x = margin.left + i * stepX, y = margin.top + pH - v * pH;
            i === 0 ? learningCtx.moveTo(x, y) : learningCtx.lineTo(x, y);
        });
        learningCtx.stroke();

        // Current rate label
        if (matchRateHistory.length > 0) {
            const last = matchRateHistory[matchRateHistory.length - 1];
            const lx = margin.left + (matchRateHistory.length - 1) * stepX;
            const ly = margin.top + pH - last * pH;
            learningCtx.font = '9px monospace';
            learningCtx.fillStyle = '#e8a838';
            learningCtx.textAlign = 'left';
            learningCtx.fillText(`${Math.round(last * 100)}%`, lx + 5, ly - 4);
        }

        learningCtx.font = '8px monospace'; learningCtx.fillStyle = '#777'; learningCtx.textAlign = 'center';
        learningCtx.fillText('Cycle #', W / 2, H - 3);
    }

    // ============================================================
    // ANIMATION LOOP
    // ============================================================
    function animationLoop() {
        dpr = window.devicePixelRatio || 1;
        lastDpr = dpr;

        drawMEA();
        drawCircle();
        drawRaster();
        drawLearning();

        // Decay
        for (let i = 0; i < 64; i++) {
            if (spikeDecay[i] > 0) { spikeDecay[i]--; if (spikeDecay[i] === 0) spikeCounts[i] = 0; }
            meaSpikes[i] *= 0.85;
            meaStims[i] *= 0.85;
        }

        animationFrameId = requestAnimationFrame(animationLoop);
    }

    // ============================================================
    // TOOLTIP
    // ============================================================
    rasterCanvas.addEventListener('mousemove', (e) => {
        const rect = rasterCanvas.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const ch = Math.min(63, Math.max(0, Math.floor(y / (rect.height / 64))));
        rasterTooltip.textContent = `Ch ${ch} (${CHANNEL_REGION[ch]})`;
        rasterTooltip.hidden = false;
        rasterTooltip.style.left = `${e.clientX + 12}px`;
        rasterTooltip.style.top = `${e.clientY + 12}px`;
    });
    rasterCanvas.addEventListener('mouseleave', () => { rasterTooltip.hidden = true; });

    // ============================================================
    // CL VISUALISER INTERFACE
    // ============================================================
    function reset() {
        meaSpikes.fill(0); meaStims.fill(0); spikeCounts.fill(0); spikeDecay.fill(0);
        rasterSpikes.fill(0); rasterStims.fill(0);
        rasterCol = 0; rasterBeatBounds.length = 0;
        currentPattern = []; lastPattern = null; lastResult = null;
        matchRateHistory = [];
        smoothedMatchRate = 0;
        spikeLogCounter = 0; spikeLogAccum = 0;
        totalCycles = 0; totalMatches = 0;
        hammingHistory.length = 0; cycleRecords.length = 0;
        for (const k in kDistribution) delete kDistribution[k];
        for (const k in patternCounts) delete patternCounts[k];
        feedbackRecords.length = 0;
        buildCycleGrid(cycleLength);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(animationLoop);
        console.log('[neurosynth] Visualiser reset');
    }

    function attributesReset(dataStreamName, initialAttributes) {
        if (initialAttributes && initialAttributes.cycle_length) {
            cycleLength = initialAttributes.cycle_length;
            buildCycleGrid(cycleLength);
            console.log(`[neurosynth] Config: cycle_length=${cycleLength}`);
        }
    }

    function attributesUpdated(dataStreamName, updatedAttributes) {
        // No dynamic attribute changes expected
    }

    function process(dataStreamName, timestamp, data) {
        if (dataStreamName === 'cl_spikes') {
            const ch = data.channel;
            meaSpikes[ch] = 1.0;
            spikeDecay[ch] = 8;
            spikeCounts[ch] = Math.min(spikeCounts[ch] + 1, 5);

            // Raster
            const col = rasterCol % RASTER_COLS;
            rasterSpikes[ch * RASTER_COLS + col] = 1;

            // Spike rate logging (summary every ~30 events)
            spikeLogAccum++;
            spikeLogCounter++;
            if (spikeLogCounter >= 30) {
                spikeLogCounter = 0;
            }
        }

        if (dataStreamName === 'cl_stims') {
            const ch = data.channel;
            meaStims[ch] = 1.0;
            const col = rasterCol % RASTER_COLS;
            rasterStims[ch * RASTER_COLS + col] = 1;
        }

        if (dataStreamName === 'neurosynth_beat') {
            const idx = data.beat_index;
            updateCycleCell(idx, data.spikes, data.fire);
            currentPattern = data.pattern_so_far || [];
            patternDisplay.textContent = currentPattern.join('');

            // Raster beat boundary
            rasterBeatBounds.push(rasterCol % RASTER_COLS);
            if (rasterBeatBounds.length > 200) rasterBeatBounds.shift();

            // Console log
            console.log(`[beat ${data.beat_index}] spikes=${data.spikes} rate=${data.rate} ${data.fire ? 'FIRE' : 'silent'} threshold=${data.threshold}`);

            // Audio
            if (audioInitialized && !muted) {
                if (data.fire) playBeatFire();
                else playBeatSilent();
            }
        }

        if (dataStreamName === 'neurosynth_cycle') {
            lastPattern = data.pattern;
            lastResult = {
                match: data.match,
                k: data.k,
                rotation: data.rotation,
                min_hamming: data.min_hamming,
                label: data.label,
            };
            currentPattern = [];
            matchRateHistory.push(data.match_rate);

            // Learning tracking
            totalCycles = data.cycle_num;
            totalMatches = data.euclidean_count;
            kDistribution[data.k] = (kDistribution[data.k] || 0) + 1;
            if (data.match && data.label) {
                patternCounts[data.label] = (patternCounts[data.label] || 0) + 1;
            }
            if (!data.match) {
                hammingHistory.push(data.min_hamming);
                if (hammingHistory.length > 100) hammingHistory.shift();
            }

            // Cycle history record
            cycleRecords.push({
                num: data.cycle_num,
                pattern: data.pattern.join(''),
                match: data.match,
                k: data.k,
                hamming: data.min_hamming,
                label: data.label,
                rate: data.match_rate,
            });
            if (cycleRecords.length > 20) cycleRecords.shift();

            // Update basic stats
            statCycles.textContent = data.cycle_num;
            statMatches.textContent = data.euclidean_count;
            statRate.textContent = Math.round(data.match_rate * 100) + '%';
            if (data.match) statLastMatch.textContent = data.label;

            // Update extended stats
            if (statOverall) {
                statOverall.textContent = totalCycles > 0
                    ? Math.round(totalMatches / totalCycles * 100) + '%'
                    : '--';
            }
            if (statHamming && hammingHistory.length > 0) {
                const avgH = hammingHistory.reduce((a, b) => a + b, 0) / hammingHistory.length;
                statHamming.textContent = avgH.toFixed(2);
                statHamming.style.color = avgH < 2 ? '#4caf50' : avgH < 3 ? '#e8a838' : '#e85338';
            }
            if (statDominant) {
                const sorted = Object.entries(patternCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
                statDominant.textContent = sorted.length > 0
                    ? sorted.map(([label, ct]) => `${label}: ${ct}x`).join(', ')
                    : '--';
            }

            // k-Distribution display
            if (kDistDisplay) {
                const maxK = cycleLength;
                let html = '<div style="display:flex;gap:4px;align-items:flex-end;height:60px;">';
                for (let k = 0; k <= maxK; k++) {
                    const ct = kDistribution[k] || 0;
                    const pct = totalCycles > 0 ? ct / totalCycles : 0;
                    const h = Math.max(2, pct * 200);
                    const color = ct > 0 ? (k >= 2 && k <= maxK - 2 ? '#e8a838' : '#666') : '#333';
                    html += `<div style="flex:1;display:flex;flex-direction:column;align-items:center;">`;
                    html += `<span style="font-size:0.55rem;color:#888;">${ct}</span>`;
                    html += `<div style="width:100%;height:${h}px;background:${color};border-radius:2px;"></div>`;
                    html += `<span style="font-size:0.55rem;color:#666;">k${k}</span>`;
                    html += `</div>`;
                }
                html += '</div>';
                kDistDisplay.innerHTML = html;
            }

            // --- FEP Feedback Display ---
            const fb = data.feedback || {};
            const refPat = data.ref_pattern || euclidean(data.k, cycleLength);

            // FEP Feedback panel — show what happened
            if (fepFeedback) {
                if (data.match) {
                    fepFeedback.innerHTML =
                        `<div style="color:#4caf50;font-weight:600;">REWARD — Euclidean match!</div>` +
                        `<div style="margin-top:3px;color:#aaa;">${fb.description || `Structured stim on sensory channels`}</div>` +
                        `<div style="margin-top:3px;font-size:0.6rem;color:#666;">` +
                        `FEP: Pattern matched ${data.label} — structured, predictable stimulation delivered ` +
                        `(low surprise). This reinforces the neural pathway that produced this pattern.</div>`;
                } else {
                    fepFeedback.innerHTML =
                        `<div style="color:#e85338;font-weight:600;">PUNISHMENT — Not Euclidean (H=${data.min_hamming})</div>` +
                        `<div style="margin-top:3px;color:#aaa;">${fb.description || `Random noise on channels`}</div>` +
                        `<div style="margin-top:3px;font-size:0.6rem;color:#666;">` +
                        `FEP: Pattern did not match any Euclidean rhythm — random, unpredictable stimulation ` +
                        `(high surprise). This disrupts the neural pathway, pushing it toward more structured patterns.</div>`;
                }
            }

            // Pattern comparison panel — neurons vs reference Euclidean
            if (patternCompare) {
                let html = '<div style="display:flex;gap:16px;align-items:flex-start;">';

                // Neurons' pattern
                html += '<div><div style="color:#888;font-size:0.6rem;margin-bottom:4px;">Neurons produced:</div>';
                html += '<div style="display:flex;gap:2px;">';
                for (let i = 0; i < data.pattern.length; i++) {
                    const fire = data.pattern[i];
                    const bg = fire ? (data.match ? '#4caf50' : '#e8a838') : '#222';
                    const txt = fire ? '#000' : '#555';
                    html += `<div style="width:22px;height:22px;border-radius:3px;background:${bg};color:${txt};display:flex;align-items:center;justify-content:center;font-size:0.6rem;font-weight:700;">${fire}</div>`;
                }
                html += `</div><div style="color:#888;font-size:0.55rem;margin-top:2px;">k=${data.k} (${data.pattern.filter(b => b === 1).length} pulses in ${data.pattern.length} steps)</div>`;
                html += '</div>';

                // Reference pattern
                html += '<div style="margin-left:8px;"><div style="color:#888;font-size:0.6rem;margin-bottom:4px;">Nearest Euclidean E(${data.k},${cycleLength}):</div>'.replace('${data.k}', data.k).replace('${cycleLength}', cycleLength);
                html += '<div style="display:flex;gap:2px;">';
                for (let i = 0; i < refPat.length; i++) {
                    const fire = refPat[i];
                    const bg = fire ? '#2a6b2e' : '#1a1a2e';
                    const txt = fire ? '#8f8' : '#555';
                    html += `<div style="width:22px;height:22px;border-radius:3px;background:${bg};color:${txt};display:flex;align-items:center;justify-content:center;font-size:0.6rem;font-weight:700;">${fire}</div>`;
                }
                html += '</div><div style="color:#888;font-size:0.55rem;margin-top:2px;">';
                if (data.match) {
                    html += `<span style="color:#4caf50;">Match! Rotation ${data.rotation}</span>`;
                } else {
                    // Show which beats differ
                    const diffs = [];
                    for (let i = 0; i < data.pattern.length; i++) {
                        if (data.pattern[i] !== refPat[i]) diffs.push(i + 1);
                    }
                    html += `<span style="color:#e85338;">Differs at beat${diffs.length > 1 ? 's' : ''} ${diffs.join(',')}</span>`;
                }
                html += '</div></div>';

                html += '</div>';
                patternCompare.innerHTML = html;
            }

            // Feedback log — scrollable history
            if (fb.type) {
                feedbackRecords.push({
                    num: data.cycle_num,
                    type: fb.type,
                    desc: fb.description || '',
                    pattern: data.pattern.join(''),
                    match: data.match,
                    k: data.k,
                    hamming: data.min_hamming,
                    rate: data.match_rate,
                });
                if (feedbackRecords.length > 20) feedbackRecords.shift();
            }
            if (feedbackLog) {
                let html = '';
                for (let i = feedbackRecords.length - 1; i >= 0; i--) {
                    const r = feedbackRecords[i];
                    const icon = r.type === 'reward' ? '+' : '-';
                    const color = r.type === 'reward' ? '#4caf50' : '#e85338';
                    html += `<div style="color:${color};margin:2px 0;border-left:2px solid ${color};padding-left:6px;">`;
                    html += `<span style="color:#888;">#${r.num}</span> [${r.pattern}] `;
                    html += `<span style="font-weight:600;">${icon} ${r.type.toUpperCase()}</span> `;
                    html += `<span style="color:#777;">${r.desc}</span>`;
                    html += `</div>`;
                }
                feedbackLog.innerHTML = html || 'Waiting for data...';
            }

            cycleResult.innerHTML = data.match
                ? `<span style="color:#4caf50;">${data.label} (rot ${data.rotation})</span>`
                : `<span style="color:#e85338;">k=${data.k} H=${data.min_hamming}</span>`;

            buildCycleGrid(cycleLength);

            // Console log with feedback detail
            const fbDesc = fb.description ? ` | ${fb.description}` : '';
            console.log(`[cycle ${data.cycle_num}] pattern=[${data.pattern.join('')}] k=${data.k} ${data.match ? data.label : 'H=' + data.min_hamming} rate=${Math.round(data.match_rate * 100)}% matches=${data.euclidean_count}/${data.cycle_num}${fbDesc}`);

            // Audio
            smoothedMatchRate = smoothedMatchRate * 0.85 + data.match_rate * 0.15;
            if (audioInitialized && !muted) {
                if (data.match) playEuclideanMatch(lastResult);
                else playMiss(lastResult);
                playRhythm(data.pattern, 80);
                updateLearningAudio();
            }
        }

        // Advance raster column on each spike/stim event
        rasterCol++;
    }

    function draw(browserTimestampMs, dataStreamTimestamp) {
        // Animation loop handles rendering
    }

    // Initialize
    buildCycleGrid(cycleLength);
    reset();

    return {
        reset,
        attributesReset,
        attributesUpdated,
        process,
        draw,
    };
}
