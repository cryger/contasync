const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const app = express();
const PORT = 5000;
//const SECRET_KEY = "secreto123"; // Usa variables de entorno para mayor seguridad

app.use(express.json());
app.use(cors());

// Configuración de la base de datos PostgreSQL
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "contasync",
  password: "123456",
  port: 5433,
});

// ** Ruta de autenticación **
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userQuery = await pool.query("SELECT * FROM usuarios", [
      email,
    ]);

    if (userQuery.rows.length === 0) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const user = userQuery.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    // Generar token JWT
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
