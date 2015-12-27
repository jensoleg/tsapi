cd /tmp

# try to remove the repo if it already exists

rm -rf tsapi; true

git clone https://github.com/jensoleg/tsapi.git

cd ./tsapi

npm install --unsafe-perm --production

if [ -z "$APP" ]; then
    export APP=app.js
fi

pm2 start -x $APP --no-daemon