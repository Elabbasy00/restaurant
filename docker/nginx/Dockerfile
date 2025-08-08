# The first stage
# Build React static files
FROM node:18-alpine as build

WORKDIR /app/frontend
COPY ./frontend/package.json ./
COPY ./frontend/yarn.lock ./


# RUN apk add --no-cache --virtual .gyp \
#     python3 \
#     make \
#     g++ \
#     git \
#     && 
#     && apk del .gyp
RUN yarn install 
# --frozen-lockfile 

COPY ./frontend/ ./
RUN yarn build



FROM nginx:alpine

RUN rm /etc/nginx/conf.d/*


# *.conf files in conf.d/ dir get included in main config
COPY ./docker/nginx/development /etc/nginx/conf.d


EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]