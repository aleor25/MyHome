const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Registro de nuevo usuario
exports.registro = async (req, res) => {
  try {
    const { nombre, email, password, confirmPassword, telefono, tipoUsuario } = req.body;

    // Validaciones
    if (!nombre || !email || !password || !confirmPassword || !tipoUsuario) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }

    if (tipoUsuario !== 'propietario' && tipoUsuario !== 'huesped') {
      return res.status(400).json({ error: 'Tipo de usuario inválido' });
    }

    // Verificar si el email ya existe
    const usuarioExistente = await User.obtenerPorEmail(email);
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Crear usuario
    const nuevoUsuario = await User.crearUsuario(
      nombre,
      email,
      password,
      telefono,
      tipoUsuario
    );

    // Generar token
    const token = jwt.sign(
      { id: nuevoUsuario.id, tipo_usuario: nuevoUsuario.tipo_usuario },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: nuevoUsuario,
      token
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

// Inicio de sesión
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const usuario = await User.obtenerPorEmail(email);
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const passwordValida = await User.verificarPassword(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token
    const token = jwt.sign(
      { id: usuario.id, tipo_usuario: usuario.tipo_usuario },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      mensaje: 'Inicio de sesión exitoso',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario
      },
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

// Obtener perfil del usuario (requiere autenticación)
exports.obtenerPerfil = async (req, res) => {
  try {
    const usuario = await User.obtenerPorId(req.userId);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

// Actualizar perfil del usuario
exports.actualizarPerfil = async (req, res) => {
  try {
    const { nombre, telefono } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const usuario = await User.actualizarPerfil(req.userId, nombre, telefono);

    res.json({
      mensaje: 'Perfil actualizado exitosamente',
      usuario
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

// Cambiar contraseña
exports.cambiarContrasena = async (req, res) => {
  try {
    const { contrasenaActual, contrasenaNueva } = req.body;

    if (!contrasenaActual || !contrasenaNueva) {
      return res.status(400).json({ error: 'Se requieren ambas contraseñas' });
    }

    if (contrasenaNueva.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar contraseña actual
    const usuario = await User.obtenerConPassword(req.userId);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const bcrypt = require('bcryptjs');
    const contrasenaValida = await bcrypt.compare(contrasenaActual, usuario.password);

    if (!contrasenaValida) {
      return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
    }

    // Hashear nueva contraseña
    const hashNuevo = await bcrypt.hash(contrasenaNueva, 10);
    await User.cambiarContrasena(req.userId, hashNuevo);

    res.json({ mensaje: 'Contraseña cambiada exitosamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
};