from typing import Annotated, override

from cl.app import BaseApplicationConfig
from cl.app.model import (
    ChannelList,
    DurationSeconds,
    FrozenBaseModel,
    StimAmplitudeMicroAmps,
    StimFrequencyHz,
    StimPulseWidthMicroSeconds,
)
from pydantic import ConfigDict, Field, NonNegativeFloat, PositiveFloat, PositiveInt


class AssayConfigModel(FrozenBaseModel):
    """Configuration for pre-experiment baseline assay."""

    model_config = ConfigDict(title="Assay Configuration", extra="forbid", frozen=True)

    duration_s: Annotated[
        DurationSeconds,
        Field(title="Assay Duration (s)", description="Duration of baseline recording before experiment."),
    ]

    active_channel_threshold_hz: Annotated[
        NonNegativeFloat,
        Field(
            title="Active Channel Threshold (Hz)",
            description="Minimum spike rate for a channel to be considered active.",
        ),
    ]


class ClockStimulusConfigModel(FrozenBaseModel):
    """Configuration for the rhythmic clock stimulus applied to sensory channels."""

    model_config = ConfigDict(title="Clock Stimulus Configuration", extra="forbid", frozen=True)

    stim_every_n_ticks: Annotated[
        PositiveInt,
        Field(title="Stim Every N Ticks", description="Stimulate sensory channels every N ticks."),
    ]

    current_ua: Annotated[
        StimAmplitudeMicroAmps,
        Field(title="Stimulus Current (uA)", description="Biphasic stimulus current amplitude."),
    ]

    phase_width_us: Annotated[
        StimPulseWidthMicroSeconds,
        Field(title="Phase Width (us)", description="Duration of each stimulus phase."),
    ]


class RewardFeedbackConfigModel(FrozenBaseModel):
    """Configuration for structured reward feedback (Euclidean match)."""

    model_config = ConfigDict(title="Reward Feedback Configuration", extra="forbid", frozen=True)

    current_ua: Annotated[
        StimAmplitudeMicroAmps,
        Field(title="Reward Current (uA)"),
    ]

    phase_width_us: Annotated[
        StimPulseWidthMicroSeconds,
        Field(title="Reward Phase Width (us)"),
    ]

    frequency_hz: Annotated[
        StimFrequencyHz,
        Field(title="Reward Frequency (Hz)", description="Burst frequency for structured feedback."),
    ]

    duration_s: Annotated[
        PositiveFloat,
        Field(title="Reward Duration (s)", description="Duration of the reward stimulation burst."),
    ]


class PunishmentFeedbackConfigModel(FrozenBaseModel):
    """Configuration for random punishment feedback (non-Euclidean)."""

    model_config = ConfigDict(title="Punishment Feedback Configuration", extra="forbid", frozen=True)

    current_ua: Annotated[
        StimAmplitudeMicroAmps,
        Field(title="Punishment Current (uA)"),
    ]

    phase_width_us: Annotated[
        StimPulseWidthMicroSeconds,
        Field(title="Punishment Phase Width (us)"),
    ]

    freq_min_hz: Annotated[
        StimFrequencyHz,
        Field(title="Min Frequency (Hz)", description="Minimum random burst frequency."),
    ]

    freq_max_hz: Annotated[
        StimFrequencyHz,
        Field(title="Max Frequency (Hz)", description="Maximum random burst frequency."),
    ]

    firing_probability: Annotated[
        float,
        Field(
            title="Firing Probability",
            description="Probability of stimulating each channel per burst.",
            gt=0,
            le=1,
        ),
    ]

    duration_s: Annotated[
        PositiveFloat,
        Field(title="Punishment Duration (s)"),
    ]


class ThresholdConfigModel(FrozenBaseModel):
    """Configuration for the adaptive binary threshold."""

    model_config = ConfigDict(title="Threshold Configuration", extra="forbid", frozen=True)

    window_size: Annotated[
        PositiveInt,
        Field(title="Window Size", description="Number of recent beat rates used for adaptive threshold."),
    ]

    initial_value: Annotated[
        NonNegativeFloat,
        Field(title="Initial Threshold", description="Starting threshold before enough data accumulates."),
    ]


class NeuroSynthConfigModel(BaseApplicationConfig):
    """Configuration for the NeuroSynth Euclidean rhythm detection experiment."""

    model_config = ConfigDict(title="NeuroSynth Configuration", extra="forbid", frozen=True)

    cycle_length: Annotated[
        int,
        Field(
            title="Cycle Length (beats)",
            description="Number of beats per cycle. 8 is recommended (17% Euclidean baseline).",
            ge=4,
            le=16,
        ),
    ]

    bpm: Annotated[
        int,
        Field(
            title="BPM",
            description="Tempo in beats per minute. Affects ticks per beat.",
            ge=40,
            le=160,
        ),
    ]

    tick_rate_hz: Annotated[
        int,
        Field(
            title="Tick Rate (Hz)",
            description="Main loop tick rate. 30 Hz recommended.",
            ge=10,
            le=100,
        ),
    ]

    assay: Annotated[
        AssayConfigModel,
        Field(title="Assay Configuration"),
    ]

    clock_stimulus: Annotated[
        ClockStimulusConfigModel,
        Field(title="Clock Stimulus Configuration"),
    ]

    reward_feedback: Annotated[
        RewardFeedbackConfigModel,
        Field(title="Reward Feedback Configuration"),
    ]

    punishment_feedback: Annotated[
        PunishmentFeedbackConfigModel,
        Field(title="Punishment Feedback Configuration"),
    ]

    threshold: Annotated[
        ThresholdConfigModel,
        Field(title="Threshold Configuration"),
    ]

    sensory_channels: Annotated[
        ChannelList,
        Field(title="Sensory Channels", description="Channels for clock stimulus input (left half of MEA)."),
    ]

    motor_channels: Annotated[
        ChannelList,
        Field(title="Motor Channels", description="Channels for spike readout (right half of MEA)."),
    ]

    @override
    def estimate_duration_s(self) -> float:
        assay_time = self.assay.duration_s
        beat_duration = 60.0 / self.bpm
        cycle_duration = beat_duration * self.cycle_length
        # Estimate ~500 cycles for a full experiment
        experiment_time = cycle_duration * 500
        return assay_time + experiment_time + 15.0
