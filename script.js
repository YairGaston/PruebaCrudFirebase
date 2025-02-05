// Configuración de Firebase
// const firebaseConfig = {
//  apiKey: "TU_API_KEY",
//  authDomain: "TU_AUTH_DOMAIN",
//  projectId: "TU_PROJECT_ID",
//  storageBucket: "TU_STORAGE_BUCKET",
//  messagingSenderId: "TU_MESSAGING_SENDER_ID",
//  appId: "TU_APP_ID"
// };
  
  // Inicializar Firebase
  //const app = firebase.initializeApp(firebaseConfig);
  //const db = firebase.firestore(); 
  
  // Referencias al DOM
  const formulario = document.getElementById('formulario');
  const mensaje = document.getElementById('mensaje');
  const tablaRegistros = document.getElementById('tablaRegistros').getElementsByTagName('tbody')[0];
  
  let registroEditando = null; // Variable para almacenar el ID del registro que se está editando
  
  // Función para cargar los registros desde Firestore
  async function cargarRegistros() {
    tablaRegistros.innerHTML = ''; // Limpiar la tabla
    try {
      const snapshot = await db.collection('datosPersonales').orderBy('fechaRegistro', 'desc').get();
      snapshot.forEach(doc => {
        const data = doc.data();
        const fila = document.createElement('tr');
  
        fila.innerHTML = `
          <td>${data.nombre}</td>
          <td>${data.email}</td>
          <td>${data.telefono}</td>
          <td>${data.direccion}</td>
          <td>${data.edad}</td>
          <td>
            <button class="editar" data-id="${doc.id}">Editar</button>
            <button class="eliminar" data-id="${doc.id}">Eliminar</button>
          </td>
        `;
        tablaRegistros.appendChild(fila);
      });
  
      // Agregar eventos a los botones de editar y eliminar
      document.querySelectorAll('.editar').forEach(btn => {
        btn.addEventListener('click', () => cargarRegistroParaEditar(btn.dataset.id));
      });
  
      document.querySelectorAll('.eliminar').forEach(btn => {
        btn.addEventListener('click', () => eliminarRegistro(btn.dataset.id));
      });
    } catch (error) {
      console.error('Error al cargar los registros:', error);
      mensaje.textContent = 'Ocurrió un error al cargar los registros.';
    }
  }
  
  // Función para guardar o actualizar un registro
  formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const id = document.getElementById('idRegistro').value;
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const telefono = document.getElementById('telefono').value;
    const direccion = document.getElementById('direccion').value;
    const edad = document.getElementById('edad').value;
  
    try {
      if (registroEditando) {
        // Actualizar el registro existente
        await db.collection('datosPersonales').doc(id).update({
          nombre,
          email,
          telefono,
          direccion,
          edad,
          fechaRegistro: firebase.firestore.FieldValue.serverTimestamp()
        });
        mensaje.textContent = 'Registro actualizado correctamente.';
      } else {
        // Crear un nuevo registro
        await db.collection('datosPersonales').add({
          nombre,
          email,
          telefono,
          direccion,
          edad,
          fechaRegistro: firebase.firestore.FieldValue.serverTimestamp()
        });
        mensaje.textContent = 'Registro guardado correctamente.';
      }
  
      // Limpiar el formulario
      formulario.reset();
      document.getElementById('idRegistro').value = '';
      registroEditando = null;
  
      // Recargar los registros
      cargarRegistros();
    } catch (error) {
      console.error('Error al guardar/actualizar el registro:', error);
      mensaje.textContent = 'Ocurrió un error al guardar/actualizar el registro.';
    }
  });
  
  // Función para cargar un registro en el formulario para editar
  async function cargarRegistroParaEditar(id) {
    try {
      const doc = await db.collection('datosPersonales').doc(id).get();
      const data = doc.data();
  
      document.getElementById('idRegistro').value = id;
      document.getElementById('nombre').value = data.nombre;
      document.getElementById('email').value = data.email;
      document.getElementById('telefono').value = data.telefono;
      document.getElementById('direccion').value = data.direccion;
      document.getElementById('edad').value = data.edad;
  
      registroEditando = true; // Indicar que estamos editando
    } catch (error) {
      console.error('Error al cargar el registro para editar:', error);
      mensaje.textContent = 'Ocurrió un error al cargar el registro para editar.';
    }
  }
  
  // Función para eliminar un registro
  async function eliminarRegistro(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este registro?')) return;
  
    try {
      await db.collection('datosPersonales').doc(id).delete();
      mensaje.textContent = 'Registro eliminado correctamente.';
      cargarRegistros(); // Recargar los registros
    } catch (error) {
      console.error('Error al eliminar el registro:', error);
      mensaje.textContent = 'Ocurrió un error al eliminar el registro.';
    }
  }
  
  // Cargar los registros al iniciar la página
  cargarRegistros();