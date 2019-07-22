FROM python:3

RUN apt-get update
RUN apt-get install -y libsnappy-dev

RUN pip install pipenv

RUN mkdir /app
WORKDIR /app

COPY Pipfile /app
COPY Pipfile.lock /app
RUN pipenv install --dev --system --deploy --ignore-pipfile

COPY . /app