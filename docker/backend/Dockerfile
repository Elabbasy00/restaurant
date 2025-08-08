FROM python:3.13-slim

RUN useradd -d /home/wsgi -m -s /bin/bash -u 0 -o -g root wsgi
USER wsgi


ENV DockerHOME=/home/wsgi

RUN mkdir -p $DockerHOME

WORKDIR /home/wsgi

ADD ./backend/requirements /home/wsgi/backend/requirements

ENV PATH=/home/wsgi/.local/bin:$PATH

RUN pip install --upgrade pip


RUN pip3 install -r backend/requirements/base.txt

ADD --chown=wsgi:wsgi C:/Al-hamd/Desktop/Desktop/Al-hamd/backend /home/wsgi/backend
ADD --chown=wsgi:wsgi C:/Al-hamd/Desktop/Desktop/Al-hamd/docker /home/wsgi/docker

RUN chmod +x /home/wsgi/docker/backend/wsgi-entrypoint.sh