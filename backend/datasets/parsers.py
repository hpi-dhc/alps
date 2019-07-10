import json
from django.http import QueryDict
from rest_framework import parsers

import logging
logger = logging.getLogger(__name__)


class MultiFileParser(parsers.MultiPartParser):

    def parse(self, stream, media_type=None, parser_context=None):
        result = super().parse(
            stream,
            media_type=media_type,
            parser_context=parser_context
        )

        # get dataset id from url
        dataset = parser_context.get('kwargs').get('dataset')

        data = []
        json_string = result.data.get('JSON', "{}")
        metadata = json.loads(json_string)
        for key, file in result.files.items():
            file_metadata = metadata.get(key, {})
            data.append({
                'name': file.name,
                'path': file,
                'dataset': dataset,
                **file_metadata
            })

        return data


class JSONURLParser(parsers.JSONParser):

    def parse(self, stream, media_type=None, parser_context=None):
        result = super().parse(
            stream,
            media_type=media_type,
            parser_context=parser_context
        )

        for key, value in parser_context.get('kwargs').items():
            result[key] = value

        return result
