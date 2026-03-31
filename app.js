import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const app = express();
const PORT = 3000;
const SECRET_KEY = 'mi_clave_secreta';

// Middleware
app.use(express.json());

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static('public'));

// IMPORTANTE: permitir frontend consultar el backend (CORS : Cross-Origin Resource Sharing)
app.use(cors());

// ==========================
// MIDDLEWARE JWT
// ==========================
const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = req.query.token || authHeader && authHeader.split(' ')[1];


  if (!token) {
    return res.status(401).json({ mensaje: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ mensaje: 'Token inválido' });
  }
};

// ==========================
// RUTAS
// ==========================

// HOME
app.get('/', (req, res) => {
   res.sendFile(__dirname + '/public/index.html');
});

// LOGIN (para localStorage)
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === '1234') {

    const payload = {
      username,
      role: 'admin'
    };

    const token = jwt.sign(payload, SECRET_KEY, {
      expiresIn: '1h'
    });

    return res.json({
      mensaje: 'Login exitoso',
      token
    });
  }

  res.status(401).json({ mensaje: 'Credenciales incorrectas' });
});

// DASHBOARD (protegido)
app.get('/dashboard', verificarToken, (req, res) => {
  res.json({
    mensaje: 'Acceso autorizado al dashboard',
    usuario: req.usuario
  });
});
// ==========================
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});