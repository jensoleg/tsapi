# BUILD image: docker build -t jensoleg/tsapi .
# RUN image  : docker run --name tsapi -e "APP=app.js" -p 8081:8081 -d jensoleg/tsapi

FROM node:0.10

MAINTAINER Jens-Ole Graulund <jensole@graulund.net>

RUN npm install --unsafe-perm --production -g pm2@0.15.6

EXPOSE 8081

ADD start.sh /tmp/

RUN chmod +x /tmp/start.sh

CMD ./tmp/start.sh