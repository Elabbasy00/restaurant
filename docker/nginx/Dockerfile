FROM nginx:alpine


RUN rm /etc/nginx/conf.d/*


# *.conf files in conf.d/ dir get included in main config
COPY ./docker/nginx/development /etc/nginx/conf.d


EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]