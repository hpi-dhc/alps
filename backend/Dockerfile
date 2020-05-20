FROM python:3.7-slim

ENV POETRY_VIRTUALENVS_CREATE=FALSE \
    POETRY_VERSION=1.0.4

RUN apt-get update
RUN apt-get install --no-install-recommends -y \
    build-essential libpq-dev libsnappy-dev git

WORKDIR /app

RUN pip install "poetry==${POETRY_VERSION}"

COPY pyproject.toml poetry.lock /app/
RUN poetry install --no-interaction --no-ansi

COPY . /app