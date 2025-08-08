FROM python:3.13-slim

# Create user and set up environment
RUN useradd -d /home/wsgi -m -s /bin/bash -u 1000 -g root wsgi
USER wsgi

ENV DockerHOME=/home/wsgi
WORKDIR $DockerHOME

# Set up PATH and upgrade pip
ENV PATH=/home/wsgi/.local/bin:$PATH
RUN pip install --upgrade pip

# First copy just requirements to leverage Docker cache
COPY --chown=wsgi:root ./backend/requirements ./backend/requirements
RUN pip3 install -r backend/requirements/base.txt

# Then copy the rest of the files
COPY --chown=wsgi:root ./backend ./backend
COPY --chown=wsgi:root ./docker ./docker

# Make entrypoint executable
RUN chmod +x /home/wsgi/docker/backend/wsgi-entrypoint.sh