TO RUN PROJECT
npm run start:dev

TO BUILD THE DOCKER IMAGE (if there was a problem with the one already created)
docker build . -t dario-araya/api-reign

TO RUN THE IMAGE
docker run -p 8080:3000 dario-araya/api-reign

CREDENTIALS TO GET THE TOKEN (for authorization)
{
    "email": "UserTest@correo.cl",
    "password": "Y29udHJhc2XDsWE="
}

