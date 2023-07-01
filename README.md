# ASP-Secinaro-RodriguezSotto

Obl 1 ASP BACKEND

## Instrucciones para levantar el proyecto

### Produccion

#### Simular build de produccion mediante docker

```bash
docker create volume aspback

# Mediante yarn
yarn drb

# Mediante docker puro
docker build -t \"aspback\" . -f ./docker/Dockerfile
docker run -d -p 80:80 --name aspback -v \"aspback:/var/log\" --env-file ./env
```

### Desarrollo

#### Local

```bash
yarn # El equipo utilizo yarn pero es posible tambien utilizar 'npm install'

yarn dev # npm run dev
```

#### Docker

```bash
yarn d:dev # Lanzar el contenedor de desarrollo mediante el script de npm

docker-compose -f docker/docker-compose.yaml up # Lanzar el contenedor de desarrollo mediante docker-compose directo
```

#### Base de Datos

Para correr las migraciones utilizar el siguiente comando:

```bash
npx prisma migrate dev
```

Para correr todas las migraciones desde cero:

```bash
npx prisma migrate reset
```

##### Base de Datos en Produccion

Para correr las migraciones en produccion:

1. Conectarse a una instancia de EC2 de la aplicacion de Beanstalk
2. Ejecutar `sudo docker ps`
3. Copiar el ID del contenedor que corre nuestra app (Deberia haber corriendo solo un contenedor)
4. Correr el comando `sudo docker exec -it <IdContenedor> /bin/sh` para conctarnos al shell del contenedor
5. Correr el comando `npx prisma migrate deploy`

> :exclamation: Es posible evitar conectarse al contenedor de EC2 y correr las migraciones desde la maquina local si cambiamos la variable de nuestro `.env` con la base de datos que utiliza AWS. Esto no es recomendable pues al correr las migraciones desde el contenedor en AWS nos aseguramos que dichas migraciones son exactamente las que precisa la version del codigo que esta actualmente desplegado en la nube.
