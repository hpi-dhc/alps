import pandas as pd
import numpy as np
from celery import Task, shared_task
from django.db import transaction

from datasets.models import Dataset, Signal, Sample, Tag, SignalChunkFile, Analysis, Process
from datasets.constants import process_status, signal_types

import logging
logger = logging.getLogger(__name__)

class DatasetTask(Task):

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        dataset = Dataset.objects.get(id=args[1])
        dataset.status = process_status.ERROR
        dataset.save()

class ProcessTask(Task):

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        process = Process.objects.get(task=task_id)
        process.status = process_status.ERROR
        process.save()

def save_parsed_signals(dataset, signals):
    signal_ids = []

    for signal_name, data in signals.items():
        signal_type = data.get('type', signal_types.OTHER)
        series = data['series']

        if series.empty:
            continue

        y_min = None
        y_max = None
        if np.issubdtype(series.dtype, np.number):
            y_min = series.min()
            y_max = series.max()

        signal = Signal(
            name=signal_name,
            dataset=dataset,
            type=signal_type,
            raw_file_id=data.get('raw_file_id'),
            frequency=data.get('frequency'),
            unit=data.get('unit'),
            first_timestamp=series.index.min(),
            last_timestamp=series.index.max(),
            y_min=y_min,
            y_max=y_max,
            user_id=dataset.user_id,
        )
        signal.save()
        signal_ids.append(signal.id)

        if signal_type in [signal_types.NN_INTERVAL, signal_types.RR_INTERVAL, signal_types.TAGS]:
            signal.save_to_table(series)
        else:
            signal.save_to_files(series)

    return signal_ids


@shared_task(base=DatasetTask)
def parse_raw_files(file_ids, dataset_id):
    dataset = Dataset.objects.get(id=dataset_id)
    dataset.status = process_status.PROCESSING
    dataset.save()
    result = dataset.source.parse(file_ids)

    for value in result.values():
        value['series'].dropna(inplace=True)

    with transaction.atomic():
        signal_ids = save_parsed_signals(dataset, result)
        dataset.status = process_status.PROCESSED
        dataset.save()

    return signal_ids


@shared_task(base=ProcessTask, bind=True)
def start_analysis(self, analysis_id):
    analysis = Analysis.objects.get(id=analysis_id)
    analysis.process.task = self.request.id
    analysis.process.status = process_status.PROCESSING
    analysis.process.save()

    analysis.result = analysis.compute()
    analysis.save()

    analysis.process.status = process_status.PROCESSED
    analysis.process.save()

    return analysis_id


@shared_task(base=ProcessTask, bind=True)
def filter_signal(self, signal_id):
    signal = Signal.objects.get(id=signal_id)
    signal.process.task = self.request.id
    signal.process.status = process_status.PROCESSING
    signal.process.save()

    plugin = signal.process.method.get_plugin()
    filter_instance = plugin(signal.id)
    filter_result = filter_instance.process()
    filtered_series = filter_result.get('series')
    result_info = filter_result.get('info')

    if hasattr(signal, 'filtered_signal'):
        signal.filtered_signal.delete()

    if signal.raw_signal.samples.count() > 0:
        signal.save_to_table(filtered_series)
    else:
        signal.save_to_files(filtered_series)

    signal.y_min = filtered_series.min()
    signal.y_max = filtered_series.max()
    signal.first_timestamp = filtered_series.first_valid_index()
    signal.last_timestamp = filtered_series.last_valid_index()
    signal.save()

    signal.process.status = process_status.PROCESSED
    signal.process.info = result_info
    signal.process.save()

    return signal_id
