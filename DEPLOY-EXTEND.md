# Deploy Extend — Admin Dashboard Staging & Producción

Guía específica para el deploy del dashboard en el entorno Extend. El `README.md` principal es el del proyecto upstream.

---

## Archivos relevantes

| Archivo | Propósito |
|---|---|
| `docker-compose.staging.yml` | Compose para staging (red externa, sin puerto expuesto) |
| `docker-compose.yaml` | Compose original del proyecto (referencia) |
| `.env.staging` | Variables de entorno para staging (**NO en git**) |
| `.env.production` | Variables de entorno para producción (**NO en git**) |

---

## Crear `.env.staging` (NO está en git)

```bash
cat > ~/librechat-admin-dashboard/.env.staging << 'EOF'
MONGODB_URI=mongodb://extend-mongodb:27017/LibreChat
MONGODB_DB_NAME=LibreChat
DASHBOARD_PASSWORD=<password-seguro>
SESSION_SECRET=<string-aleatorio-largo>
EOF
```

Generar un `SESSION_SECRET` seguro:
```bash
openssl rand -hex 32
```

---

## Crear `.env.production` (para producción)

Mismas variables, mismos valores. El dashboard accede al mismo MongoDB en ambos entornos:

```bash
cat > ~/librechat-admin-dashboard/.env.production << 'EOF'
MONGODB_URI=mongodb://extend-mongodb:27017/LibreChat
MONGODB_DB_NAME=LibreChat
DASHBOARD_PASSWORD=<password-seguro>
SESSION_SECRET=<mismo-string-aleatorio>
EOF
```

---

## docker-compose.staging.yml — puntos importantes

```yaml
services:
  next-app:
    build:
      args:
        - NEXT_PUBLIC_BASE_PATH=/dashboard   # el app vive en /dashboard
    environment:
      - NODE_ENV=production    # ⚠ CRÍTICO: necesario para cookies secure con HTTPS
      - MONGODB_URI=mongodb://extend-mongodb:27017/LibreChat
    env_file:
      - .env.staging
    networks:
      - extend-network         # debe estar en la misma red que extend-mongodb
```

> **Por qué `NODE_ENV=production`**: Las cookies de sesión tienen el flag `secure: true` cuando `NODE_ENV=production`. Sin esto, las cookies no se envían en conexiones HTTPS y el login no funciona.

---

## Conectividad con MongoDB

El dashboard necesita acceder a `extend-mongodb`, que arranca en la red `internal` de LibreChat. Si ves el error `getaddrinfo EAI_AGAIN extend-mongodb`, es porque MongoDB no está en `extend-network`:

```bash
# Verificar que MongoDB está en extend-network
docker network inspect extend-network | grep extend-mongodb

# Si no está, conectarlo (sin recrear el contenedor)
docker network connect extend-network extend-mongodb

# Verificar conectividad desde el dashboard
docker exec librechat-admin-dashboard ping -c1 extend-mongodb
```

Este paso es necesario en el primer deploy. En reinicios posteriores MongoDB ya estará en la red.

---

## Comandos de deploy

```bash
# Primera vez o tras cambios en el código
cd ~/librechat-admin-dashboard
docker compose -f docker-compose.staging.yml up -d --build

# Reiniciar sin rebuild (si solo cambiaron variables de entorno)
docker compose -f docker-compose.staging.yml up -d

# Ver logs
docker logs -f librechat-admin-dashboard

# Acceder al dashboard
# https://dash-preludio.extend.cl/dashboard
```

---

## Actualizar (pull de cambios)

```bash
cd ~/librechat-admin-dashboard
git pull https://<TOKEN>@github.com/rjmarin/librechat-admin-dashboard.git main
docker compose -f docker-compose.staging.yml up -d --build
```

---

## Solución de problemas conocidos

### Login redirige a `/dashboard/dashboard` y desloguea

**Causa**: Bug en `src/app/login/page.tsx` — llamaba a `getAbsolutePath("/dashboard")` que duplica el basePath.

**Ya corregido** en commit `46332c3`. Si vuelve a aparecer tras merge con upstream, verificar que en `src/app/login/page.tsx` la línea de redirect diga:
```typescript
window.location.href = getAbsolutePath("/");  // ✅ correcto
// window.location.href = getAbsolutePath("/dashboard");  // ❌ causa double prefix
```

### Error 500 al cargar datos

**Causa**: MongoDB no alcanzable desde el contenedor del dashboard.

**Solución**: Ver sección "Conectividad con MongoDB" arriba.

### Cookies no persistentes (logout inmediato tras login)

**Causa**: `NODE_ENV` no está en `production`, las cookies `secure` no se envían por HTTPS.

**Solución**: Verificar que `NODE_ENV=production` esté en el `docker-compose.staging.yml` bajo `environment`.

---

## Para producción

1. Crear `~/librechat-admin-dashboard/.env.production`
2. Actualizar `docker-compose.staging.yml` para usar `env_file: .env.production` (o crear un `docker-compose.production.yml`)
3. El dominio cambia a `https://dashboard.preludio.extend.cl/dashboard`
4. Asegurarse de que nginx de producción (`conf.d/dashboard.preludio.extend.cl.conf`) apunte al contenedor `librechat-admin-dashboard:3000`
