// Menú del restaurante
const tituloPersonalizado = "Bar Restaurant Paulo's";
const errorGrave="Pedidos no disponible en este momento, favor intente llamando al 800 800 1313";

//constructor Plato
class Plato {
    constructor(nombre, precio) {
        this.nombre = nombre;
        this.precio = precio;
    }
}

//armando menu y llamada asyncrona a la function que carga archivo para despues 
// llenar a la clase Plato 
class Menu {
    constructor() {
        this.platos = {};
    }

    async cargarDesdeArchivo(nombreArchivo) {
        try {
            const response = await fetch(nombreArchivo);
            if (!response.ok) {
                //throw new Error('Error al cargar el archivo');
                console.log('Error al cargar el archivo:');
                mostrarPopup(tituloPersonalizado, errorGrave);
            }
            const menuJSON = await response.json();
            for (let id in menuJSON) {
                if (menuJSON.hasOwnProperty(id)) {
                    const platoJSON = menuJSON[id];
                    this.platos[id] = new Plato(platoJSON.nombre, platoJSON.precio);
                }
            }
        } catch (err) {
            console.error('Error al cargar el archivo:', err);
            mostrarPopup(tituloPersonalizado, errorGrave);
            //throw err; // Re-lanza el error para que pueda ser manejado externamente si es necesario
        }
    }
}

//me encanto un mensaje personalizado
function mostrarPopup(titulo, mensaje) {
    const popup = document.getElementById('popupG');
    const popupTitle = document.getElementById('popup-title');
    const popupMessage = document.getElementById('popup-message');

    popupTitle.textContent = titulo;
    popupMessage.textContent = mensaje;

    popup.style.display = 'block';

    const confirmarBtn = document.getElementById('confirmarBtn');

    //no podria faltar su function con flecha
    confirmarBtn.addEventListener('click', () => {
        popup.style.display = 'none';
    });
}

//importante manejo de error
const menu = new Menu();
menu.cargarDesdeArchivo('data.json')
    .then(() => {
        console.log(menu);

        cargarPlatosEnComboBox(menu);

    })
    .catch((err) => {
        console.error('Error al cargar el archivo:', err);
        mostrarPopup(tituloPersonalizado, errorGrave);
    });

//Inicializo arreglo pedido
let pedido = [];

    // Agrega el evento click al botón
    document.getElementById('btnAgregarPlato').addEventListener("click", agregarPlato);

    document.getElementById('btnLimpiarPedido').addEventListener("click", limpiarPedido);

    document.getElementById('btnMostrarPedido').addEventListener("click", mostrarPedido);

    document.getElementById('btnQuitarPlato').addEventListener("click", quitarPlato);

    // Cargar platos en el combo box
    
    cargarCantidadesEnComboBox();

    function cargarPlatosEnComboBox(menu) {
        const platoSelect = document.getElementById('platoSelect');
    
        // Limpiar el combo box antes de agregar las opciones
        platoSelect.innerHTML = "";
    
        for (const key in menu.platos) {
            const option = document.createElement('option');
            option.value = key;
            option.text = `${menu.platos[key].nombre} - $${menu.platos[key].precio}`;
            platoSelect.add(option);
        }
    }
    
    // Promesa adicional para cargar los platos en el combobox después de cargar el menú
    const cargarPlatosPromise = new Promise((resolve, reject) => {
        menu.cargarDesdeArchivo('data.json')
            .then(() => {
                console.log(menu);
                cargarPlatosEnComboBox(menu);
                resolve(); // Resuelve la promesa una vez que se hayan cargado los platos en el combobox
            })
            .catch((err) => {
                console.error('Error al cargar el archivo:', err);
                reject(err); // Rechaza la promesa si hay un error al cargar el menú
            });
    });
    
    // Ejecuta la promesa
    cargarPlatosPromise.then(() => {
        console.log('Platos cargados en el combobox');
    }).catch((err) => {
        console.error('Error al cargar los platos en el combobox:', err);
    });
    
    //cargar combo box de cantidades de platos en el pedido
    function cargarCantidadesEnComboBox() {
        const cantidadSelect = document.getElementById('cantidadSelect');
    
        for (let i = 1; i <= 10; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.text = i;
            cantidadSelect.add(option);
        }
    }


// En la inicialización de la página, cargar el pedido desde localStorage
window.onload = function() {
    cargarPedidoDesdeLocalStorage();
};


function quitarPlato() {


    const platoSelect = document.getElementById('platoSelect');
    const cantidadSelect = document.getElementById('cantidadSelect');

    // Obtén el índice seleccionado
    const selectedIndex = platoSelect.selectedIndex;
   
    const opcion = platoSelect.value;

    // Verifica si se ha seleccionado un índice válido
    if (selectedIndex !== -1) {

        console.log("existe el elemento vamos a borrar");

        // Obtiene el nombre del plato desde el arreglo de opciones usando el índice
        const nombrePlatoQuitar = platoSelect.options[selectedIndex].text;
        const cantidadPlatoQuitar = parseInt(cantidadSelect.value);

        if (!isNaN(cantidadPlatoQuitar) && cantidadPlatoQuitar > 0) {

            // Verifica si el plato está en el pedido
            const index = pedido.findIndex(item => item.opcion === opcion);

            if (index !== -1) {
                // Si el plato está en el pedido, reduce la cantidad o elimina el elemento si es necesario
                if (pedido[index].cantidad > cantidadPlatoQuitar) {
                    pedido[index].cantidad -= cantidadPlatoQuitar;
                } else {
                   pedido.splice(index, 1); // Elimina el elemento del pedido si la cantidad a quitar es igual o mayor
                }

                // Actualiza la tabla y el resumen del pedido
                actualizarTablaPedido();
                actualizarResumenPedido();
            } else {
                mostrarPopup(tituloPersonalizado, 'El plato especificado no se encuentra en el pedido.');
            }
        } else {
            mostrarPopup(tituloPersonalizado, 'Cantidad no válida. Por favor, elige una cantidad entre 1 y 10.');
        }
    } else {
        mostrarPopup(tituloPersonalizado, 'Por favor, selecciona un plato.');
    }
}

// Función para agregar un plato al pedido
function agregarPlato() {
    const platoSelect = document.getElementById('platoSelect');
    const cantidadSelect = document.getElementById('cantidadSelect');
    const opcion = platoSelect.value;
    const cantidad = parseInt(cantidadSelect.value);

    if (!isNaN(cantidad) && cantidad > 0 && cantidad <= 10) {
        // Verifica si el plato ya está en el pedido
        const platoExistente = pedido.find(item => item.opcion === opcion);

        if (platoExistente) {
            // Si existe, aumenta la cantidad
            platoExistente.cantidad += cantidad;
        } else {
            // Si no existe, agrega un nuevo elemento al pedido
            pedido.push({ opcion, cantidad });
        }

    // Guardar el pedido en localStorage
    localStorage.setItem('pedido', JSON.stringify(pedido));

        // Actualiza la tabla y el resumen del pedido
        actualizarTablaPedido();
        actualizarResumenPedido();

    } else {
       mostrarPopup(tituloPersonalizado, 'Cantidad no válida. Por favor, elige una cantidad entre 1 y 10.');
    }
}

// Función para cargar el pedido desde localStorage
function cargarPedidoDesdeLocalStorage() {

    const pedidoGuardado = localStorage.getItem('pedido');
    if (pedidoGuardado) {
        pedido = JSON.parse(pedidoGuardado);
        // Llamar a cargarPlatosEnComboBox para cargar el menú antes de actualizar la tabla
        cargarPlatosEnComboBox().then(menu => {
            actualizarTablaPedido(menu);
            actualizarResumenPedido();
        }).catch(err => {
            console.error('Error al cargar el menú:', err);
            mostrarPopup(tituloPersonalizado, 'Error al cargar el menú:');
        });
    }
}



// Función para agregar un plato al arreglo de pedido
function agregarAlPedido(opcion, cantidad) {
    const cuerpoTablaPedido = document.getElementById('cuerpoTablaPedido');
    const resumenPedido = document.getElementById('resumenPedido');

    const fila = document.createElement('tr');

    const nombrePlato = menu[opcion].nombre;
    const precioUnitario = menu[opcion].precio;
    const total = precioUnitario * cantidad;

    const celdaPlato = document.createElement('td');
    celdaPlato.textContent = nombrePlato;
    fila.appendChild(celdaPlato);

    const celdaPrecioUnitario = document.createElement('td');
    celdaPrecioUnitario.textContent = `$${precioUnitario}`;
    fila.appendChild(celdaPrecioUnitario);

    const celdaCantidad = document.createElement('td');
    celdaCantidad.textContent = cantidad;
    fila.appendChild(celdaCantidad);

    const celdaTotal = document.createElement('td');
    celdaTotal.textContent = `$${total}`;
    fila.appendChild(celdaTotal);

    cuerpoTablaPedido.appendChild(fila);

    const listItem = document.createElement('li');
    listItem.innerHTML = `<span>${cantidad}x</span>${nombrePlato} - $${total}`;
    resumenPedido.appendChild(listItem);

}

function actualizarTablaPedido() {
    const cuerpoTablaPedido = document.getElementById('cuerpoTablaPedido');
    cuerpoTablaPedido.innerHTML = ""; // Limpia la tabla antes de actualizar

        pedido.forEach(item => {
        const fila = document.createElement('tr');

        const nombrePlato = menu.platos[item.opcion].nombre; // Utiliza menu.platos[item.opcion] en lugar de menu[item.opcion]
        const precioUnitario = menu.platos[item.opcion].precio;
        const total = precioUnitario * item.cantidad;

        const celdaPlato = document.createElement('td');
        celdaPlato.textContent = nombrePlato;
        fila.appendChild(celdaPlato);

        const celdaPrecioUnitario = document.createElement('td');
        celdaPrecioUnitario.textContent = `$${precioUnitario}`;
        fila.appendChild(celdaPrecioUnitario);

        const celdaCantidad = document.createElement('td');
        celdaCantidad.textContent = item.cantidad;
        fila.appendChild(celdaCantidad);

        const celdaTotal = document.createElement('td');
        celdaTotal.textContent = `$${total}`;
        fila.appendChild(celdaTotal);

        cuerpoTablaPedido.appendChild(fila);

         });

   // Guardar el pedido actualizado en localStorage
   localStorage.setItem('pedido', JSON.stringify(pedido));


}


function actualizarResumenPedido() {
    const resumenPedido = document.getElementById('resumenPedido');
    resumenPedido.innerHTML = ""; // Limpia el resumen antes de actualizar

        pedido.forEach(item => {

        const nombrePlato = menu.platos[item.opcion].nombre; // Utiliza menu.platos[item.opcion] en lugar de menu[item.opcion]
        const precioUnitario = menu.platos[item.opcion].precio;
        const total = precioUnitario * item.cantidad;

        const listItem = document.createElement('li');
        listItem.innerHTML = `<span>${item.cantidad}x</span>${nombrePlato} - $${total}`;
        resumenPedido.appendChild(listItem);
        });

}


// Función para limpiar el pedido
function limpiarPedido() {

    Swal.fire({
        title: "¿Estás seguro de que deseas borrar el pedido?",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: "Borrar",
        denyButtonText: `Volver`
    }).then(async (result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {

            const cuerpoTablaPedido = document.getElementById('cuerpoTablaPedido');

            // Limpia la tabla y oculta nuevamente
            cuerpoTablaPedido.innerHTML = "";
            document.getElementById('tablaPedido').style.display = 'none';
        
            // Eliminar el pedido del localStorage
            localStorage.removeItem('pedido');
        
            window.location.reload();


        } else if (result.isDenied) {

            Swal.fire("Sigamos con el Pedido!", "", "info");
        
        }
    });

}

// Función para mostrar el pedido
function mostrarPedido() {

    if (pedido.length === 0) {
        mostrarPopup(tituloPersonalizado, 'El pedido está vacío. Por favor, agrega platos antes de mostrar el pedido.');
        return;
    }

    const tablaPedido = document.getElementById('tablaPedido');

    // Cambia la propiedad de visualización a 'table' (muestra la tabla)
    tablaPedido.style.display = 'table';


    // Mostrar mensaje de confirmación y luego mostrar el formulario
    mostrarPopup(tituloPersonalizado, 'Pedido listo. ¡Gracias por tu pedido! Ingrese sus datos personales y a Disfrutar!!!');

}


