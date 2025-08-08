FROM python:3.13-slim

# Create user (changed UID from 0 to 1000 for better security)
RUN useradd -d /home/wsgi -m -s /bin/bash -u 1000 -g root wsgi
USER wsgi

ENV DockerHOME=/home/wsgi
WORKDIR $DockerHOME

# First copy only requirements to leverage Docker cache
COPY --chown=wsgi:root ./backend/requirements ./backend/requirements

ENV PATH=/home/wsgi/.local/bin:$PATH
RUN pip install --upgrade pip && \
    pip install -r backend/requirements/base.txt

# Then copy the rest of the files
COPY --chown=wsgi:root ./backend ./backend
COPY --chown=wsgi:root ./docker ./docker

# Verify and set executable permissions
RUN ls -la /home/wsgi/docker/backend/ && \
    chmod +x /home/wsgi/docker/backend/wsgi-entrypoint.sh && \
    [ -f /home/wsgi/docker/backend/wsgi-entrypoint.sh ] || (echo "Entrypoint missing!" && exit 1)