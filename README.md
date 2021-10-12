# Soap Inventory

_Pasos para instalar el api en un servidor local o productivo_

## Comenzando 🚀

_Clona el repositorio desde:_

```
git clone https://github.com/poncho02/soap_inventory.git
```

### Pre-requisitos 📋

_Que cosas necesitas para instalar el API_

```
Node 10.x
NPM
GIT
```

### Instalación 🔧

_Instala Node.js._

```
brew install node
```
_Verificamos la versión de node._

```
node -v ó npm -v
```

_Instala los modulos de NPM con el comando._

```
npm install
```

_En la raíz del proyecto, crear un archivo de ambiente (.env) sustiyendo los asteriscos con los datos reales._

```
#Credentials

url=***********
client_id=************
key_id=*********

USER_EXCEL=******
PASS_EXCEL=*********
URL_EXCEL=*********

```

_Inicia paquete para correr background el api._

```
npm install forever -g
```

_Iniciar el api._

```
forever start index.js
```

_La ruta del invetario CT es:._

```
http://localhost:3004/download-inventory
```

_La ruta del invetario EXEL es:._

```
http://localhost:3004/download-inventory-exel
```
_donde el localhost es el dominio del servidor en caso de estar en servidor web._
