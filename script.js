const SUPABASE_URL = "https://hclutvtzsgcvdbdljxds.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_I7FDj5HSjKUIGhquqaMVXQ_2j_T7eus";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

supabaseClient
    .from("reportes")
    .select("id")
    .limit(1)
    .then(({ data, error }) => {
        if (error) {
            console.log(
                "Supabase conectado, pero la tabla está protegida:",
                error
            );
        } else {
            console.log(
                "✅ SafeVoice conectado correctamente con Supabase:",
                data
            );
        }
    });

let editandoPublicacion = false;

function mostrarFormulario() {

    const formulario = document.getElementById("formularioReporte");

    formulario.style.display = "block";

    formulario.scrollIntoView({
        behavior: "smooth"
    });
}


function mostrarSolicitudDNI() {

    const solicitud = document.getElementById("solicitudDNI");

    solicitud.style.display = "block";

    solicitud.scrollIntoView({
        behavior: "smooth"
    });
}

async function enviarReporte() {
    const tipo = document.getElementById("tipoSituacion").value;
    const lugar = document.getElementById("lugarSituacion").value.trim();
    const gradoSeccion = document.getElementById("gradoSeccion").value;
    const fecha = document.getElementById("fechaSituacion").value;
    const descripcion = document.getElementById("descripcionSituacion").value.trim();
    const dni = document.getElementById("dniEstudiante").value.trim();

    if (
        tipo === "" ||
        gradoSeccion === "" ||
        lugar === "" ||
        fecha === "" ||
        descripcion === ""
    ) {
        alert("Por favor, completa todos los datos del reporte.");
        return;
    }

    if (dni === "") {
        alert("Por favor, ingresa tu número de DNI.");
        return;
    }

let reportes = JSON.parse(localStorage.getItem("safevoice_reportes")) || [];

// Obtener los códigos existentes desde Supabase
const { data: reportesSupabase, error: errorCodigos } =
    await supabaseClient
        .from("reportes")
        .select("codigo");

if (errorCodigos) {
    console.error("Error al obtener los códigos:", errorCodigos);

    alert(
        "No se pudo generar el código del reporte.\n\n" +
        "Por favor, inténtalo nuevamente."
    );

    return;
}

// Buscar el número mayor utilizado
let numeroMayor = 0;

reportesSupabase.forEach((reporte) => {
    const numero = parseInt(
        String(reporte.codigo).replace("SV-", ""),
        10
    );

    if (!isNaN(numero) && numero > numeroMayor) {
        numeroMayor = numero;
    }
});

const numero = numeroMayor + 1;
const codigo = "SV-" + String(numero).padStart(3, "0");

    // Guardar el reporte en Supabase
    const { error } = await supabaseClient
        .from("reportes")
        .insert([
            {
                codigo: codigo,
                tipo: tipo,
                grado_seccion: gradoSeccion,
                lugar: lugar,
                fecha: fecha,
                descripcion: descripcion,
                dni: dni,
                estado: "Pendiente"
            }
        ]);

    if (error) {
        console.error("Error al guardar en Supabase:", error);

        alert(
            "No se pudo enviar el reporte.\n\n" +
            "Por favor, inténtalo nuevamente."
        );

        return;
    }

    // Mantener temporalmente el almacenamiento local
    const nuevoReporte = {
        codigo,
        tipo,
        gradoSeccion,
        lugar,
        fecha,
        descripcion,
        dni,
        estado: "Pendiente",
        fechaRegistro: new Date().toLocaleString()
    };

    reportes.push(nuevoReporte);

    localStorage.setItem(
        "safevoice_reportes",
        JSON.stringify(reportes)
    );

    alert(
        "Reporte recibido correctamente.\n\n" +
        "Código de seguimiento: " + codigo +
        "\n\n" +
        "Tu identidad será tratada de manera confidencial."
    );

    document.getElementById("formularioReporte").style.display = "none";
    document.getElementById("solicitudDNI").style.display = "none";

    document.getElementById("tipoSituacion").value = "";
    document.getElementById("gradoSeccion").value = "";
    document.getElementById("lugarSituacion").value = "";
    document.getElementById("fechaSituacion").value = "";
    document.getElementById("descripcionSituacion").value = "";
    document.getElementById("dniEstudiante").value = "";
}



/* =========================
   ACCESO ADMINISTRATIVO
========================= */

function mostrarAccesoAdmin() {

    const acceso = document.getElementById("accesoAdmin");

    acceso.style.display = "block";

    acceso.scrollIntoView({
        behavior: "smooth"
    });
}


function ingresarAdministrador() {

    const usuario =
        document.getElementById("usuarioAdmin").value.trim();

    const contrasena =
        document.getElementById("contrasenaAdmin").value;

    if (
        usuario === "director" &&
        contrasena === "safevoice2026"
    ) {

        /* Ocultar contenido público */

        document.querySelector(".bienvenida").style.display = "none";

        document.querySelector(".infografia").style.display = "none";

        document.querySelector(".infografia-publicada").style.display = "none";

        document.querySelector(".reportar").style.display = "none";

        document.querySelector(".formulario-reporte").style.display = "none";

        document.querySelector(".solicitud-dni").style.display = "none";


        /* Ocultar acceso administrativo */

        document.getElementById("accesoAdmin").style.display = "none";


        /* Ocultar pie de página */

        document.querySelector("footer").style.display = "none";


        /* Mostrar panel del director */

        document.getElementById("panelDirector").style.display = "block";


        /* Mostrar menú principal del director */

        document.querySelector(".opciones-director").style.display = "flex";

        document.getElementById("seccionReportes").style.display = "none";

        document.getElementById("seccionPublicacion").style.display = "none";


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } else {

        alert("Usuario o contraseña incorrectos.");

    }
}


/* =========================
   REPORTES
========================= */

async function mostrarReportes() {
    document.querySelector(".opciones-director").style.display = "none";
    document.getElementById("seccionPublicacion").style.display = "none";
    document.getElementById("seccionReportes").style.display = "block";

    const lista = document.getElementById("listaReportes");

    lista.innerHTML = `
        <div class="sin-reportes">
            <p>⏳ Cargando reportes...</p>
        </div>
    `;

    // Obtener reportes desde Supabase
    const { data, error } = await supabaseClient
        .from("reportes")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        console.error("Error al consultar reportes:", error);

        lista.innerHTML = `
            <div class="sin-reportes">
                <p>❌ No se pudieron cargar los reportes.</p>
            </div>
        `;

        return;
    }

    if (!data || data.length === 0) {
        lista.innerHTML = `
            <div class="sin-reportes">
                <p>📭 No hay reportes registrados.</p>
            </div>
        `;
        return;
    }

    lista.innerHTML = "";

    data.forEach((reporte) => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-reporte";

        const fechaRegistro = reporte.created_at
            ? new Date(reporte.created_at).toLocaleString()
            : "";

        tarjeta.innerHTML = `
            <div class="cabecera-reporte">
                <strong>${reporte.codigo}</strong>
                <span class="estado-reporte">${reporte.estado}</span>
            </div>

            <p><strong>Situación:</strong> ${reporte.tipo}</p>

            <p><strong>Grado y sección:</strong> ${reporte.grado_seccion}</p>

            <p><strong>Lugar:</strong> ${reporte.lugar}</p>

            <p><strong>Fecha:</strong> ${reporte.fecha}</p>

            <div class="descripcion-reporte">
                <strong>Descripción:</strong>
                <p>${reporte.descripcion}</p>
            </div>

            <div class="dni-reporte">
                🔒 <strong>DNI del comunicante:</strong> ${reporte.dni}
            </div>

            <div class="acciones-reporte">

    <button
        class="boton-detalle"
        onclick="verDetalleReporte('${reporte.codigo}')"
    >
        👁️ Detalle
    </button>

    <button
        onclick="cambiarEstadoReporte('${reporte.codigo}', 'En revisión')"
    >
        🔎 En revisión
    </button>

    <button
        onclick="cambiarEstadoReporte('${reporte.codigo}', 'Atendido')"
    >
        ✅ Atendido
    </button>

    ${
        reporte.estado === "Atendido"
            ? `
                <button
                    class="boton-eliminar-reporte"
                    onclick="eliminarReporte('${reporte.codigo}')"
                >
                    🗑️ Eliminar
                </button>
              `
            : ""
    }

</div>

            </div>

            <small>Registrado: ${fechaRegistro}</small>
        `;

        lista.appendChild(tarjeta);
    });
}

async function cambiarEstadoReporte(codigo, nuevoEstado) {

    const { error } = await supabaseClient
        .from("reportes")
        .update({
            estado: nuevoEstado
        })
        .eq("codigo", codigo);

    if (error) {
        console.error("Error al actualizar el estado:", error);
        alert("❌ No se pudo actualizar el estado del reporte.");
        return;
    }

    alert("✅ Estado actualizado correctamente.");

    mostrarReportes();
}

async function verDetalleReporte(codigo) {

    const { data, error } = await supabaseClient
        .from("reportes")
        .select("*")
        .eq("codigo", codigo)
        .single();

    if (error) {
    console.error("ERROR COMPLETO:", error);
    alert(
        "❌ Error al consultar:\n\n" +
        error.message
    );
    return;
}

    alert(
        "📋 DETALLE DEL REPORTE\n\n" +
        "Código: " + data.codigo +
        "\nSituación: " + data.tipo +
        "\nGrado y sección: " + data.grado_seccion +
        "\nLugar: " + data.lugar +
        "\nFecha: " + data.fecha +
        "\n\nDescripción:\n" + data.descripcion +
        "\n\n🔒 DNI del comunicante: " + data.dni +
        "\nEstado: " + data.estado
    );
}

async function eliminarReporte(codigo) {

    const confirmar = confirm(
        "¿Estás seguro de que deseas eliminar este reporte?\n\n" +
        "Código: " + codigo +
        "\n\nEsta acción no se puede deshacer."
    );

    if (!confirmar) {
        return;
    }

    const { error } = await supabaseClient
        .from("reportes")
        .delete()
        .eq("codigo", codigo);

    if (error) {
        console.error("Error al eliminar el reporte:", error);
        alert(
            "❌ No se pudo eliminar el reporte.\n\n" +
            error.message
        );
        return;
    }

    alert("✅ El reporte fue eliminado correctamente.");

    mostrarReportes();
}

function volverPanelDirector() {

    document.getElementById("seccionReportes").style.display = "none";

    document.getElementById("seccionPublicacion").style.display = "none";

    document.querySelector(".opciones-director").style.display = "flex";
}

/* =========================
   PUBLICACIONES
========================= */

function mostrarPublicacion() {

    document.querySelector(".opciones-director").style.display = "none";

    document.getElementById("seccionReportes").style.display = "none";

    document.getElementById("seccionPublicacion").style.display = "block";

    cargarPublicacionActual();
}


function volverPanelDirectorDesdePublicacion() {

    document.getElementById("seccionPublicacion").style.display = "none";

    document.querySelector(".opciones-director").style.display = "flex";
}


/* =========================
   GUARDAR PUBLICACIÓN
========================= */

async function publicarInformacion() {

    const boton = document.querySelector(".boton-publicar");

    /* Evitar múltiples clics mientras se publica */

    if (boton.disabled) {
        return;
    }

    boton.disabled = true;

    const textoOriginal = boton.textContent;

    boton.textContent = "⏳ Publicando...";


    try {

        const titulo =
            document.getElementById("tituloPublicacion").value.trim();

        const descripcion =
            document.getElementById("textoPublicacion").value.trim();

        const archivo =
            document.getElementById("imagenPublicacion").files[0];


        /* =========================
           VALIDAR DATOS
        ========================= */

        if (titulo === "") {

            alert("Por favor, escribe un título.");

            return;
        }


        if (descripcion === "") {

            alert("Por favor, escribe el mensaje o consejo.");

            return;
        }


        /* =========================
           OBTENER PUBLICACIÓN ACTUAL
        ========================= */

        const { data: publicacionesActuales, error: errorConsulta } =
            await supabaseClient
                .from("publicaciones")
                .select("*")
                .order("id", { ascending: false })
                .limit(1);


        if (errorConsulta) {

            console.error(
                "Error al consultar la publicación:",
                errorConsulta
            );

            alert(
                "❌ No se pudo consultar la publicación actual.\n\n" +
                errorConsulta.message
            );

            return;
        }


        const publicacionActual =
            publicacionesActuales &&
            publicacionesActuales.length > 0
                ? publicacionesActuales[0]
                : null;


        /* =========================
           VALIDAR IMAGEN
        ========================= */

        if (!editandoPublicacion && !archivo) {

            alert(
                "Por favor, selecciona una imagen o infografía."
            );

            return;
        }


        /* =========================
           OBTENER IMAGEN
        ========================= */

        let imagenUrl = publicacionActual
            ? publicacionActual.imagen_url
            : null;


        if (archivo) {

            const nombreArchivo =
                Date.now() +
                "_" +
                archivo.name.replace(/\s+/g, "_");


            const rutaArchivo =
                "publicaciones/" + nombreArchivo;


            const { error: errorSubida } =
                await supabaseClient.storage
                    .from("publicaciones")
                    .upload(
                        rutaArchivo,
                        archivo,
                        {
                            cacheControl: "3600",
                            upsert: false
                        }
                    );


            if (errorSubida) {

                console.error(
                    "Error al subir imagen:",
                    errorSubida
                );

                alert(
                    "❌ No se pudo subir la imagen.\n\n" +
                    errorSubida.message
                );

                return;
            }


            const { data: urlImagen } =
                supabaseClient.storage
                    .from("publicaciones")
                    .getPublicUrl(rutaArchivo);


            imagenUrl = urlImagen.publicUrl;
        }


        /* =========================
           EDITAR PUBLICACIÓN
        ========================= */

        if (editandoPublicacion && publicacionActual) {

            const { error: errorActualizacion } =
                await supabaseClient
                    .from("publicaciones")
                    .update({
                        titulo: titulo,
                        descripcion: descripcion,
                        imagen_url: imagenUrl
                    })
                    .eq("id", publicacionActual.id);


            if (errorActualizacion) {

                console.error(
                    "Error al actualizar publicación:",
                    errorActualizacion
                );

                alert(
                    "❌ No se pudo actualizar la publicación.\n\n" +
                    errorActualizacion.message
                );

                return;
            }


            alert(
                "✅ La publicación fue actualizada correctamente."
            );


        } else {

            /* =========================
               NUEVA PUBLICACIÓN
            ========================= */

            /*
               Si existe una publicación anterior,
               se elimina antes de crear la nueva.
            */

            if (publicacionesActuales &&
                publicacionesActuales.length > 0) {

                const { error: errorEliminarAnterior } =
                    await supabaseClient
                        .from("publicaciones")
                        .delete()
                        .eq("id", publicacionActual.id);


                if (errorEliminarAnterior) {

                    console.error(
                        "Error al eliminar publicación anterior:",
                        errorEliminarAnterior
                    );

                    alert(
                        "❌ No se pudo reemplazar la publicación anterior.\n\n" +
                        errorEliminarAnterior.message
                    );

                    return;
                }
            }


            /* =========================
               INSERTAR NUEVA PUBLICACIÓN
            ========================= */

            const { error: errorInsercion } =
                await supabaseClient
                    .from("publicaciones")
                    .insert([
                        {
                            titulo: titulo,
                            descripcion: descripcion,
                            imagen_url: imagenUrl
                        }
                    ]);


            if (errorInsercion) {

                console.error(
                    "Error al guardar publicación:",
                    errorInsercion
                );

                alert(
                    "❌ No se pudo guardar la publicación.\n\n" +
                    errorInsercion.message
                );

                return;
            }


            alert(
                "✅ La información fue publicada correctamente."
            );
        }


        /* =========================
           LIMPIAR FORMULARIO
        ========================= */

        document.getElementById("tituloPublicacion").value = "";

        document.getElementById("textoPublicacion").value = "";

        document.getElementById("imagenPublicacion").value = "";


        /* Restaurar modo */

        editandoPublicacion = false;


        document.querySelector(
            ".nueva-publicacion h3"
        ).textContent =
            "➕ Nueva publicación";


        boton.textContent =
            "📰 Publicar";


        /* Actualizar publicación */

        await cargarPublicacionActual();

        await cargarPublicacion();


        /* Regresar al panel */

        volverPanelDirectorDesdePublicacion();


    } catch (error) {

        console.error(
            "Error inesperado al publicar:",
            error
        );

        alert(
            "❌ Ocurrió un error inesperado.\n\n" +
            error.message
        );


    } finally {

        /*
           Volver a habilitar el botón solamente
           cuando todo el proceso haya terminado.
        */

        boton.disabled = false;

        if (!editandoPublicacion) {
            boton.textContent = "📰 Publicar";
        } else {
            boton.textContent = textoOriginal;
        }
    }
}
/* =========================
   PUBLICACIÓN ACTUAL
   PANEL DEL DIRECTOR
========================= */

async function cargarPublicacionActual() {

    const seccion =
        document.getElementById("publicacionActual");


    seccion.style.display = "none";


    const { data, error } =
        await supabaseClient
            .from("publicaciones")
            .select("*")
            .order("id", { ascending: false })
            .limit(1);


    if (error) {

        console.error(
            "Error al cargar publicación actual:",
            error
        );

        return;
    }


    if (!data || data.length === 0) {

        return;
    }


    const publicacion = data[0];


    document.getElementById("tituloActual").textContent =
        publicacion.titulo;


    document.getElementById("imagenActual").src =
        publicacion.imagen_url || "";


    document.getElementById("descripcionActual").textContent =
        publicacion.descripcion;


    seccion.style.display = "block";
}


/* =========================
   PUBLICACIÓN EN PORTADA
========================= */

async function cargarPublicacion() {

    const seccion =
        document.getElementById("seccionInfografia");


    seccion.style.display = "none";


    const { data, error } =
        await supabaseClient
            .from("publicaciones")
            .select("*")
            .order("id", { ascending: false })
            .limit(1);


    if (error) {

        console.error(
            "Error al cargar publicación en portada:",
            error
        );

        return;
    }


    if (!data || data.length === 0) {

        return;
    }


    const publicacion = data[0];


    document.getElementById("tituloInfografia").textContent =
        "📰 " + publicacion.titulo;


    document.getElementById("imagenInfografia").src =
        publicacion.imagen_url || "";


    document.getElementById("descripcionInfografia").textContent =
        publicacion.descripcion;


    seccion.style.display = "block";
}


/* =========================
   CERRAR SESIÓN
========================= */

function cerrarSesion() {

    /* Ocultar panel del director */

    document.getElementById("panelDirector").style.display = "none";


    /* Ocultar secciones internas del director */

    document.getElementById("seccionReportes").style.display = "none";

    document.getElementById("seccionPublicacion").style.display = "none";

    document.getElementById("publicacionActual").style.display = "none";


    /* Mostrar contenido público */

    document.querySelector(".contenido").style.display = "block";

    document.querySelector(".bienvenida").style.display = "block";

    document.querySelector(".infografia").style.display = "block";

    document.querySelector(".reportar").style.display = "block";


    /* Ocultar formularios */

    document.getElementById("formularioReporte").style.display = "none";

    document.getElementById("solicitudDNI").style.display = "none";


    /* Mostrar publicación en portada */

    cargarPublicacion();


    /* Mostrar pie de página */

    document.querySelector("footer").style.display = "block";


    /* Limpiar acceso */

    document.getElementById("usuarioAdmin").value = "";

    document.getElementById("contrasenaAdmin").value = "";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================
   CARGAR PUBLICACIÓN AL ABRIR
========================= */

cargarPublicacion();


/* =========================
   ELIMINAR PUBLICACIÓN
========================= */

async function eliminarPublicacion() {

    const confirmar = confirm(
        "¿Estás seguro de que deseas eliminar la publicación actual?"
    );


    if (!confirmar) {

        return;
    }


    /* Obtener publicación actual */

    const { data, error: errorConsulta } =
        await supabaseClient
            .from("publicaciones")
            .select("*")
            .order("id", { ascending: false })
            .limit(1);


    if (errorConsulta) {

        console.error(
            "Error al consultar publicación:",
            errorConsulta
        );

        alert(
            "❌ No se pudo consultar la publicación.\n\n" +
            errorConsulta.message
        );

        return;
    }


    if (!data || data.length === 0) {

        alert("No hay una publicación para eliminar.");

        return;
    }


    const publicacion = data[0];


    /* =========================
       ELIMINAR REGISTRO
    ========================= */

    const { error: errorEliminar } =
        await supabaseClient
            .from("publicaciones")
            .delete()
            .eq("id", publicacion.id);


    if (errorEliminar) {

        console.error(
            "Error al eliminar publicación:",
            errorEliminar
        );

        alert(
            "❌ No se pudo eliminar la publicación.\n\n" +
            errorEliminar.message
        );

        return;
    }


    /* =========================
       OCULTAR PUBLICACIÓN
    ========================= */

    document.getElementById("publicacionActual").style.display =
        "none";

    document.getElementById("seccionInfografia").style.display =
        "none";


    alert(
        "✅ La publicación fue eliminada correctamente."
    );
}


/* =========================
   EDITAR PUBLICACIÓN
========================= */

async function editarPublicacion() {

    /* Obtener publicación actual */

    const { data, error } =
        await supabaseClient
            .from("publicaciones")
            .select("*")
            .order("id", { ascending: false })
            .limit(1);


    if (error) {

        console.error(
            "Error al consultar publicación:",
            error
        );

        alert(
            "❌ No se pudo cargar la publicación para editar.\n\n" +
            error.message
        );

        return;
    }


    if (!data || data.length === 0) {

        alert(
            "No hay una publicación para editar."
        );

        return;
    }


    const publicacion = data[0];


    /* =========================
       CARGAR DATOS EN FORMULARIO
    ========================= */

    document.getElementById("tituloPublicacion").value =
        publicacion.titulo;


    document.getElementById("textoPublicacion").value =
        publicacion.descripcion;


    /*
       No obligamos a seleccionar una nueva imagen.
       Si no selecciona otra, se conserva la actual.
    */


    /* =========================
       MOSTRAR IMAGEN ACTUAL
    ========================= */

    const contenedorImagen =
        document.getElementById("imagenActualEdicion");

    const vistaImagen =
        document.getElementById("vistaImagenEdicion");


    if (publicacion.imagen_url) {

        vistaImagen.src =
            publicacion.imagen_url;

        contenedorImagen.style.display =
            "block";

    } else {

        contenedorImagen.style.display =
            "none";
    }


    /* =========================
       ACTIVAR MODO EDICIÓN
    ========================= */

    editandoPublicacion = true;


    document.querySelector(
        ".nueva-publicacion h3"
    ).textContent =
        "✏️ Editar publicación";


    document.querySelector(
        ".boton-publicar"
    ).textContent =
        "💾 Guardar cambios";


    document.getElementById(
        "publicacionActual"
    ).style.display = "none";


    /* =========================
       IR AL FORMULARIO
    ========================= */

    window.scrollTo({

        top:
            document.getElementById(
                "seccionPublicacion"
            ).offsetTop,

        behavior: "smooth"
    });
}