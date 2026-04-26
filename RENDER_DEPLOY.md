# 🚀 Deployment en Render

Guía para deployar **Project Estimator** en Render.com

## ⚡ Quick Deploy (2 minutos)

### 1. **Crear cuenta en Render**
- Ir a https://render.com
- Sign up con GitHub
- Autorizar acceso al repositorio

### 2. **Conectar Repositorio**
- Dashboard → New + → Blueprint
- Seleccionar `guillecarreras/project-estimator`
- Branch: `main`

### 3. **Render desplegará automáticamente**
El archivo `render.yaml` configurará:
- ✅ Web service (Node.js)
- ✅ PostgreSQL database
- ✅ Environment variables
- ✅ Auto-scaling

---

## 📋 Configuración Manual (Alternativa)

Si quieres configurar manualmente en Render Dashboard:

### Paso 1: Crear Web Service
```
Name: project-estimator
Runtime: Node
Build Command: npm ci && npm run build
Start Command: node dist/api/server.js
Plan: Free (o Starter)
```

### Paso 2: Crear PostgreSQL Database
```
Name: postgres
Database Name: project_estimator
User: postgres
Plan: Free (o Starter)
```

### Paso 3: Conectar Base de Datos
En Web Service → Environment:
```
DATABASE_URL: [Auto-populated from PostgreSQL]
JWT_SECRET: [Generate random]
NODE_ENV: production
LOG_LEVEL: info
```

---

## ✅ Verificar Deployment

Una vez deployado, verás:

```
🌐 URL: https://project-estimator.onrender.com
📊 Status: https://status.render.com

API Endpoints:
  GET    https://project-estimator.onrender.com/health
  POST   https://project-estimator.onrender.com/api/auth/login
  GET    https://project-estimator.onrender.com/api/estimations
```

---

## 🔐 Demo Credentials

```
Username: admin
Password: demo123
```

Usar en:
```bash
curl -X POST https://project-estimator.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"demo123"}'
```

---

## 🔄 Auto-Deploy desde GitHub

Con Blueprint (`render.yaml`):
- ✅ Auto-deploya en cada push a `main`
- ✅ Corre migrations automáticamente
- ✅ Reinicia servicios si falla
- ✅ Log aggregation
- ✅ Performance monitoring

---

## 🛑 Troubleshooting

### Error: "Build failed"
→ Verificar logs: Dashboard → Logs → Build

### Error: "Database connection failed"  
→ Confirmar `DATABASE_URL` en Environment

### Error: "Port 3000 not open"
→ Render asigna puerto automáticamente, usar `process.env.PORT`

### Aplicación lenta
→ Subir plan de Free a Starter ($7/mes)

---

## 📊 Monitoreo en Render

Render incluye:
- ✅ Logs en tiempo real
- ✅ Métricas (CPU, memoria, network)
- ✅ Health checks automáticos
- ✅ Error notifications

Dashboard → project-estimator → Logs

---

## 💰 Costos (Plan Free)

| Servicio | Costo | Limitaciones |
|----------|-------|--------------|
| Web Service | $0 | Spins down después 15min inactividad |
| PostgreSQL | $0 | 256MB storage |
| Bandwidth | $0 | Limitado |

**Upgrade a Starter:**
- Web: $7/mes (always on)
- PostgreSQL: $15/mes (1GB)

---

## 🔐 Seguridad

Render proporciona:
- ✅ SSL/TLS automático
- ✅ Private networks
- ✅ Encrypted environment variables
- ✅ DDoS protection

---

## 📱 URLs Importantes

- **App URL:** `https://project-estimator.onrender.com`
- **API Docs:** `https://project-estimator.onrender.com/api/info`
- **Status Page:** `https://status.render.com`
- **Dashboard:** `https://dashboard.render.com`

---

**Status:** ✅ LISTO PARA DEPLOYAR EN RENDER
