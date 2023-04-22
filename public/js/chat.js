const url = window.location.hostname.includes("localhost")
  ? "http://localhost:8080/api/usuarios/token"
  : `https://${window.location.hostname}/api/usuarios/token`;

const queryString = window.location.search;
const salaParams = new URLSearchParams(queryString);
const sala = salaParams.get("sala") ?? "global";

let usuario = null;
let socket = null;

// Referencias HTML
const txtUid = document.querySelector("#txtUid");
const txtMensaje = document.querySelector("#txtMensaje");
const txtSala = document.querySelector("#txtSala");
const ulUsuarios = document.querySelector("#ulUsuarios");
const ulMensajes = document.querySelector("#ulMensajes");
const btnSala = document.querySelector("#btnSala");
const btnSalaGlobal = document.querySelector("#btnSalaGlobal");
const btnSalir = document.querySelector("#btnSalir");

// Validar el token del localstorage
const validarJWT = async () => {
  const token = localStorage.getItem("token") || "";

  if (token.length <= 10) window.location = "index.html";

  const resp = await fetch(url, {
    headers: { "x-token": token },
  });

  const { usuario: userDB, token: tokenDB } = await resp.json();
  localStorage.setItem("token", tokenDB);
  usuario = userDB;
  document.title = usuario.nombre;

  await conectarSocket();
};

const conectarSocket = async () => {
  socket = io({
    extraHeaders: {
      "x-token": localStorage.getItem("token"),
    },
  });

  socket.on("connect", () => {
    console.log("Sockets online");
  });

  socket.on("disconnect", () => {
    console.log("Sockets offline");
  });

  socket.on("recibir-mensajes", dibujarMensajes);
  socket.on("usuarios-activos", dibujarUsuarios);

  socket.on("mensaje-privado", (payload) => {
    console.log("Privado:", payload);
  });
};

const dibujarUsuarios = (usuarios = []) => {
  let usersHtml = "";
  usuarios.forEach(({ nombre, uid }) => {
    usersHtml += `
            <li>
                <p>
                    <h5 class="text-success"> ${nombre} </h5>
                    <span class="fs-6 text-muted">${uid}</span>
                </p>
            </li>
        `;
  });

  ulUsuarios.innerHTML = usersHtml;
};

const dibujarMensajes = (mensajes = []) => {
  let mensajesHTML = "";
  mensajes.forEach(({ nombre, mensaje, sala }) => {
    mensajesHTML += `
            <li>
                <p>
                    <span class="text-primary">${nombre}: </span>
                    <span>${mensaje}</span>
                    <span class="text-muted">${sala}</span>
                </p>
            </li>
        `;
  });

  ulMensajes.innerHTML = mensajesHTML;
};

txtMensaje.addEventListener("keyup", ({ keyCode }) => {
  const mensaje = txtMensaje.value;
  const uid = txtUid.value;

  if (keyCode !== 13 || mensaje.length === 0) return;

  socket.emit("enviar-mensaje", { mensaje, uid, sala });

  txtMensaje.value = "";
});

btnSala.addEventListener("click", () => {
  if (txtSala.value.length === 0) return;
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  params.set("sala", txtSala.value);
  url.search = params.toString();
  window.location.href = url.toString();
});

btnSalaGlobal.addEventListener("click", () => {
  // borrar los parametros de la url
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  params.delete("sala");
  url.search = params.toString();
  window.location.href = url.toString();
});

btnSalir.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location = "index.html";
});

const main = async () => {
  await validarJWT();
};

main().then(() => {
  console.log("Todo listo");
});
