import logging
from pathlib import Path
from typing import override

from cl.app import BaseApplication, OutputType, RunSummary

from .config import NeuroSynthConfigModel
from .neurosynth import NeuroSynthExperiment


class NeuroSynthApplication(BaseApplication[NeuroSynthConfigModel]):
    """NeuroSynth: Euclidean rhythm detection via FEP feedback."""

    @override
    def run(self, config: NeuroSynthConfigModel, output_directory: str) -> RunSummary:
        logger = logging.getLogger(__name__)
        logger.info("Starting NeuroSynth experiment")
        logger.info(
            "Config: cycle_length=%d, bpm=%d, tick_rate=%d Hz",
            config.cycle_length,
            config.bpm,
            config.tick_rate_hz,
        )

        experiment = NeuroSynthExperiment(config, Path(output_directory))
        summary = experiment.run()

        return RunSummary(type=OutputType.TEXT, content=summary)

    @staticmethod
    @override
    def config_class() -> type[NeuroSynthConfigModel]:
        return NeuroSynthConfigModel
