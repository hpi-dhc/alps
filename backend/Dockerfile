FROM python:3

RUN pip install pipenv

RUN mkdir /app
WORKDIR /app

COPY Pipfile /app
COPY Pipfile.lock /app
RUN pipenv install --dev --system --deploy --ignore-pipfile

COPY . /app