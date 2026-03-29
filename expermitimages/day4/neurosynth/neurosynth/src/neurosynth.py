"""
NeuroSynth — Euclidean Rhythm Detection via FEP

Pipeline per cycle:
  1. CLOCK: Stim all sensory channels every Nth tick (rhythmic input)
  2. READ:  Count motor spikes per beat
  3. THRESHOLD: Above adaptive mean -> FIRE(1), below -> SILENT(0)
  4. CLASSIFY: Is the binary pattern a rotation of any E(k,n)?
  5. FEEDBACK: Euclidean -> structured (reward). Non-Euclidean -> random (punishment)
"""

import logging
import random
from dataclasses import dataclass, field
from pathlib import Path

import cl

from .config import NeuroSynthConfigModel

logger = logging.getLogger(__name__)


# ============================================================
# Euclidean Rhythm Algorithms
# ============================================================

def euclidean(k: int, n: int) -> list[int]:
    """Generate a Euclidean rhythm E(k,n) using Bjorklund's algorithm."""
    if k >= n:
        return [1] * n
    if k <= 0:
        return [0] * n

    pattern: list[list[int]] = [[1] if i < k else [0] for i in range(n)]

    for _ in range(30):
        seen: dict[str, bool] = {}
        types: list[str] = []
        for p in pattern:
            key = ",".join(str(v) for v in p)
            if key not in seen:
                seen[key] = True
                types.append(key)
        if len(types) < 2:
            break

        major = [p for p in pattern if ",".join(str(v) for v in p) == types[0]]
        minor = [p for p in pattern if ",".join(str(v) for v in p) == types[1]]
        if len(minor) > len(major):
            major, minor = minor, major

        ml = min(len(major), len(minor))
        new_pattern = [major[i] + minor[i] for i in range(ml)]
        new_pattern.extend(major[ml:])
        new_pattern.extend(minor[ml:])
        pattern = new_pattern

    return [v for group in pattern for v in group]


@dataclass
class EuclideanResult:
    match: bool
    k: int
    n: int
    rotation: int = 0
    min_hamming: int = 0
    label: str = ""


def check_euclidean(pattern: list[int]) -> EuclideanResult:
    """Check if a binary pattern is a rotation of any Euclidean rhythm E(k,n)."""
    n = len(pattern)
    k = sum(pattern)

    # Trivial cases
    if k == 0 or k == n or k == 1 or k == n - 1:
        return EuclideanResult(
            match=True, k=k, n=n, rotation=0,
            label=f"E({k},{n})",
        )

    target = euclidean(k, n)

    # Check all rotations
    for rot in range(n):
        if all(pattern[(i + rot) % n] == target[i] for i in range(n)):
            return EuclideanResult(
                match=True, k=k, n=n, rotation=rot,
                label=f"E({k},{n})",
            )

    # Not Euclidean — compute min Hamming distance
    min_dist = n
    for rot in range(n):
        dist = sum(1 for i in range(n) if pattern[(i + rot) % n] != target[i])
        min_dist = min(min_dist, dist)

    return EuclideanResult(match=False, k=k, n=n, min_hamming=min_dist)


# ============================================================
# Experiment State
# ============================================================

@dataclass
class CycleRecord:
    cycle_num: int
    pattern: list[int]
    result: EuclideanResult
    beat_spike_counts: list[int]
    beat_rates: list[float]


@dataclass
class ExperimentState:
    tick_count: int = 0
    beat_count: int = 0
    cycle_number: int = 0
    euclidean_count: int = 0

    # Current cycle accumulators
    beat_motor_spikes: int = 0
    beat_ticks: int = 0
    cycle_beats_spikes: list[int] = field(default_factory=list)
    cycle_beats_rates: list[float] = field(default_factory=list)
    cycle_pattern: list[int] = field(default_factory=list)

    # Adaptive threshold
    recent_beat_rates: list[float] = field(default_factory=list)
    threshold: float = 2.0

    # Scoring
    recent_results: list[int] = field(default_factory=list)
    cycle_history: list[CycleRecord] = field(default_factory=list)

    @property
    def match_rate(self) -> float:
        if not self.recent_results:
            return 0.0
        return sum(self.recent_results) / len(self.recent_results)


# ============================================================
# Main Experiment
# ============================================================

class NeuroSynthExperiment:
    def __init__(self, config: NeuroSynthConfigModel, output_dir: Path) -> None:
        self._config = config
        self._output_dir = output_dir
        self._ticks_per_beat = max(
            2, round(config.tick_rate_hz / (config.bpm / 60))
        )
        self._sensory = list(config.sensory_channels)
        self._motor = set(config.motor_channels)

    def run(self) -> str:
        """Run the full experiment: assay -> training loop."""
        logger.info("Running baseline assay for %.0f seconds", self._config.assay.duration_s)
        self._run_assay()

        logger.info(
            "Starting training: cycle_length=%d, ticks_per_beat=%d",
            self._config.cycle_length,
            self._ticks_per_beat,
        )
        summary = self._run_training()
        return summary

    def _run_assay(self) -> None:
        """Record baseline neural activity."""
        with cl.open() as neurons:
            recording = neurons.record(
                file_suffix="neurosynth_baseline",
                file_location=str(self._output_dir),
                stop_after_seconds=self._config.assay.duration_s,
            )
            recording.wait_until_stopped()

    def _run_training(self) -> str:
        """Main training loop: clock stim -> read spikes -> threshold -> classify -> feedback."""
        state = ExperimentState(threshold=self._config.threshold.initial_value)
        cfg = self._config

        stim_design = cl.StimDesign(
            cfg.clock_stimulus.phase_width_us,
            -cfg.clock_stimulus.current_ua,
            cfg.clock_stimulus.phase_width_us,
            cfg.clock_stimulus.current_ua,
        )
        clock_burst = cl.BurstDesign(1, 10)

        reward_stim = cl.StimDesign(
            cfg.reward_feedback.phase_width_us,
            -cfg.reward_feedback.current_ua,
            cfg.reward_feedback.phase_width_us,
            cfg.reward_feedback.current_ua,
        )
        reward_burst = cl.BurstDesign(
            max(1, int(cfg.reward_feedback.frequency_hz * cfg.reward_feedback.duration_s)),
            cfg.reward_feedback.frequency_hz,
        )

        punish_stim = cl.StimDesign(
            cfg.punishment_feedback.phase_width_us,
            -cfg.punishment_feedback.current_ua,
            cfg.punishment_feedback.phase_width_us,
            cfg.punishment_feedback.current_ua,
        )

        with cl.open() as neurons:
            # Create data streams for visualization (before loop)
            beat_stream = neurons.create_data_stream("neurosynth_beat")
            cycle_stream = neurons.create_data_stream("neurosynth_cycle")

            recording = neurons.record(
                file_suffix="neurosynth_training",
                file_location=str(self._output_dir),
                attributes={
                    "experiment": "neurosynth_euclidean_rhythm",
                    "cycle_length": cfg.cycle_length,
                    "bpm": cfg.bpm,
                    "tick_rate_hz": cfg.tick_rate_hz,
                    "ticks_per_beat": self._ticks_per_beat,
                    "config": cfg.model_dump(mode="json"),
                },
            )

            try:
                for tick in neurons.loop(
                    ticks_per_second=cfg.tick_rate_hz,
                    jitter_tolerance_frames=1,
                ):
                    state.tick_count += 1

                    # --- Count motor spikes this tick ---
                    motor_spike_count = sum(
                        1 for s in tick.analysis.spikes if s.channel in self._motor
                    )
                    state.beat_motor_spikes += motor_spike_count
                    state.beat_ticks += 1

                    # --- Clock stimulus every N ticks ---
                    if state.tick_count % cfg.clock_stimulus.stim_every_n_ticks == 0:
                        for ch in self._sensory:
                            neurons.stim(ch, stim_design, clock_burst)

                    # --- Beat boundary ---
                    if state.tick_count % self._ticks_per_beat == 0:
                        rate = (
                            state.beat_motor_spikes / state.beat_ticks
                            if state.beat_ticks > 0
                            else 0
                        )

                        # Adaptive threshold
                        state.recent_beat_rates.append(rate)
                        if len(state.recent_beat_rates) > cfg.threshold.window_size:
                            state.recent_beat_rates.pop(0)
                        if len(state.recent_beat_rates) >= 3:
                            state.threshold = (
                                sum(state.recent_beat_rates) / len(state.recent_beat_rates)
                            )

                        fire = 1 if rate > state.threshold else 0
                        state.cycle_beats_spikes.append(state.beat_motor_spikes)
                        state.cycle_beats_rates.append(rate)
                        state.cycle_pattern.append(fire)

                        logger.debug(
                            "  Beat %d: spikes=%d rate=%.3f threshold=%.3f -> %s",
                            len(state.cycle_pattern),
                            state.beat_motor_spikes, rate, state.threshold,
                            "FIRE" if fire else "silent",
                        )

                        # Publish beat data to visualization
                        beat_stream.append(
                            tick.analysis.start_timestamp,
                            {
                                "beat_index": len(state.cycle_pattern) - 1,
                                "spikes": state.beat_motor_spikes,
                                "rate": round(rate, 3),
                                "fire": fire,
                                "threshold": round(state.threshold, 3),
                                "pattern_so_far": state.cycle_pattern[:],
                            },
                        )

                        state.beat_count += 1
                        state.beat_motor_spikes = 0
                        state.beat_ticks = 0

                        # --- Cycle end ---
                        if len(state.cycle_pattern) == cfg.cycle_length:
                            self._process_cycle_end(
                                state, neurons, reward_stim, reward_burst,
                                punish_stim, cfg, cycle_stream, tick.analysis.start_timestamp,
                            )

            finally:
                recording.stop()

        return self._build_summary(state)

    def _process_cycle_end(
        self,
        state: ExperimentState,
        neurons,
        reward_stim,
        reward_burst,
        punish_stim,
        cfg: NeuroSynthConfigModel,
        cycle_stream,
        timestamp: int,
    ) -> None:
        """Classify the completed cycle and deliver feedback."""
        pattern = state.cycle_pattern[:]
        result = check_euclidean(pattern)
        state.cycle_number += 1

        state.recent_results.append(1 if result.match else 0)
        if len(state.recent_results) > 10:
            state.recent_results.pop(0)
        if result.match:
            state.euclidean_count += 1

        record = CycleRecord(
            cycle_num=state.cycle_number,
            pattern=pattern,
            result=result,
            beat_spike_counts=state.cycle_beats_spikes[:],
            beat_rates=state.cycle_beats_rates[:],
        )
        state.cycle_history.append(record)
        if len(state.cycle_history) > 100:
            state.cycle_history.pop(0)

        # Generate reference Euclidean pattern for this k
        ref_pattern = euclidean(result.k, len(pattern)) if 0 < result.k < len(pattern) else pattern

        # --- FEP Feedback ---
        feedback_info: dict = {}
        if result.match:
            # Euclidean -> structured reward on sensory channels
            reward_channels = len(self._sensory)
            for ch in self._sensory:
                neurons.stim(ch, reward_stim, reward_burst)

            feedback_info = {
                "type": "reward",
                "description": f"Structured {cfg.reward_feedback.frequency_hz}Hz burst on {reward_channels} sensory channels for {cfg.reward_feedback.duration_s}s at {cfg.reward_feedback.current_ua}uA",
                "channels_stimulated": reward_channels,
                "frequency_hz": cfg.reward_feedback.frequency_hz,
                "duration_s": cfg.reward_feedback.duration_s,
                "current_ua": cfg.reward_feedback.current_ua,
            }

            logger.info(
                "Cycle %d: [%s] k=%d %s EUCLIDEAN -> REWARD %dHz on %d sensory ch for %.2fs | rate=%.0f%% (%d/%d) | threshold=%.3f | spikes=[%s]",
                state.cycle_number,
                "".join(str(b) for b in pattern),
                result.k,
                result.label,
                cfg.reward_feedback.frequency_hz,
                reward_channels,
                cfg.reward_feedback.duration_s,
                state.match_rate * 100,
                state.euclidean_count, state.cycle_number,
                state.threshold,
                ",".join(str(s) for s in state.cycle_beats_spikes),
            )
        else:
            # Non-Euclidean -> random punishment
            freq = random.randint(
                int(cfg.punishment_feedback.freq_min_hz),
                int(cfg.punishment_feedback.freq_max_hz),
            )
            punish_burst = cl.BurstDesign(
                max(1, int(freq * cfg.punishment_feedback.duration_s)),
                freq,
            )
            all_channels = self._sensory + list(self._motor)
            punished_channels = []
            for ch in all_channels:
                if random.random() < cfg.punishment_feedback.firing_probability:
                    neurons.stim(ch, punish_stim, punish_burst)
                    punished_channels.append(ch)

            feedback_info = {
                "type": "punishment",
                "description": f"Random {freq}Hz noise on {len(punished_channels)}/{len(all_channels)} channels ({cfg.punishment_feedback.firing_probability:.0%} prob) for {cfg.punishment_feedback.duration_s}s at {cfg.punishment_feedback.current_ua}uA",
                "channels_stimulated": len(punished_channels),
                "channels_total": len(all_channels),
                "frequency_hz": freq,
                "duration_s": cfg.punishment_feedback.duration_s,
                "current_ua": cfg.punishment_feedback.current_ua,
                "firing_probability": cfg.punishment_feedback.firing_probability,
            }

            logger.info(
                "Cycle %d: [%s] k=%d H=%d -> PUNISH %dHz on %d/%d ch (%.0f%% prob) for %.2fs | ref E(%d,%d)=[%s] | rate=%.0f%% (%d/%d) | threshold=%.3f | spikes=[%s]",
                state.cycle_number,
                "".join(str(b) for b in pattern),
                result.k,
                result.min_hamming,
                freq,
                len(punished_channels), len(all_channels),
                cfg.punishment_feedback.firing_probability * 100,
                cfg.punishment_feedback.duration_s,
                result.k, len(pattern),
                "".join(str(b) for b in ref_pattern),
                state.match_rate * 100,
                state.euclidean_count, state.cycle_number,
                state.threshold,
                ",".join(str(s) for s in state.cycle_beats_spikes),
            )

        # Publish cycle result to visualization (with feedback details)
        cycle_stream.append(
            timestamp,
            {
                "cycle_num": state.cycle_number,
                "pattern": pattern,
                "ref_pattern": ref_pattern,
                "match": result.match,
                "k": result.k,
                "rotation": result.rotation,
                "min_hamming": result.min_hamming,
                "label": result.label,
                "match_rate": round(state.match_rate, 3),
                "euclidean_count": state.euclidean_count,
                "beat_spikes": state.cycle_beats_spikes[:],
                "beat_rates": [round(r, 3) for r in state.cycle_beats_rates],
                "feedback": feedback_info,
                "threshold": round(state.threshold, 3),
            },
        )

        # Reset for next cycle
        state.cycle_beats_spikes.clear()
        state.cycle_beats_rates.clear()
        state.cycle_pattern.clear()

    def _build_summary(self, state: ExperimentState) -> str:
        lines = [
            "NeuroSynth Experiment Complete",
            f"Total cycles: {state.cycle_number}",
            f"Euclidean matches: {state.euclidean_count}",
            f"Overall match rate: {state.euclidean_count / max(state.cycle_number, 1) * 100:.1f}%",
            f"Final rolling rate (last 10): {state.match_rate * 100:.1f}%",
            f"Cycle length: {self._config.cycle_length} beats",
            f"BPM: {self._config.bpm}",
            "",
        ]

        # k-value distribution
        k_counts: dict[int, int] = {}
        for record in state.cycle_history:
            k_counts[record.result.k] = k_counts.get(record.result.k, 0) + 1
        if k_counts:
            lines.append("k-value distribution (last 100 cycles):")
            for k in sorted(k_counts.keys()):
                lines.append(f"  k={k}: {k_counts[k]}")

        # Dominant patterns
        pattern_counts: dict[str, int] = {}
        for record in state.cycle_history:
            if record.result.match and record.result.label:
                pattern_counts[record.result.label] = pattern_counts.get(record.result.label, 0) + 1
        if pattern_counts:
            lines.append("")
            lines.append("Dominant Euclidean patterns:")
            for label, count in sorted(pattern_counts.items(), key=lambda x: -x[1]):
                lines.append(f"  {label}: {count}x")

        return "\n".join(lines)
