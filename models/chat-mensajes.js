class ChatMensajes {
  constructor() {
    this.mensajes = [];
    this.usuarios = {};
  }

  get ultimos10() {
    this.mensajes = this.mensajes.splice(0, 10);
    return this.mensajes;
  }

  get usuariosArr() {
    return Object.values(this.usuarios); // [ {}, {}, {}]
  }

  enviarMensaje(uid, nombre, mensaje, sala) {
    const nuevoMensaje = new Mensaje(uid, nombre, mensaje, sala);
    this.mensajes.unshift(nuevoMensaje);
  }

  conectarUsuario(usuario) {
    this.usuarios[usuario.id] = usuario;
  }

  desconectarUsuario(id) {
    delete this.usuarios[id];
  }
}

class Mensaje {
  constructor(uid, nombre, mensaje, sala = "global") {
    this.uid = uid;
    this.nombre = nombre;
    this.mensaje = mensaje;
    this.sala = sala;
    this.fecha = new Date();
  }
}

module.exports = ChatMensajes;
