const { Socket } = require("socket.io");
const { comprobarJWT } = require("../helpers");
const { ChatMensajes } = require("../models");

const chatMensajes = new ChatMensajes();

const socketController = async (socket = new Socket(), io) => {
  const usuario = await comprobarJWT(socket.handshake.headers["x-token"]);

  if (!usuario) return socket.disconnect();

  // Agregar el usuario conectado
  chatMensajes.conectarUsuario(usuario);
  io.emit("usuarios-activos", chatMensajes.usuariosArr);
  socket.emit("recibir-mensajes", chatMensajes.ultimos10);

  // Conectarlo a una sala especial
  socket.join(usuario.uid); // global, socket.id, usuario.id

  // Limpiar cuando alguien se desconeta
  socket.on("disconnect", () => {
    chatMensajes.desconectarUsuario(usuario.uid);
    io.emit("usuarios-activos", chatMensajes.usuariosArr);
  });

  socket.on("enviar-mensaje", ({ uid, mensaje, sala }) => {
    if (uid) {
      socket.to(uid).emit("mensaje-privado", { de: usuario.nombre, mensaje });
    } else {
      chatMensajes.enviarMensaje(usuario.uid, usuario.nombre, mensaje, sala);
      io.emit("recibir-mensajes", chatMensajes.ultimos10);
    }
  });
};

module.exports = {
  socketController,
};
