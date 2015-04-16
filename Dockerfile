# BUILD image: docker build -t jensoleg/tsapi .
# Run with docker run --name tsapi -e "APP=app.js" -p 8081:8081 ...

FROM node:0.12.2

MAINTAINER Jens-Ole Graulund <jensole@graulund.net>

RUN npm install -g pm2@0.12.10

EXPOSE 8080

ADD start.sh /tmp/

RUN chmod +x /tmp/start.sh

CMD ./tmp/start.sh

