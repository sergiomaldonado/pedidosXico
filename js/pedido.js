const db = firebase.database();
const auth = firebase.auth();

function logout() {
  auth.signOut();
}

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if(pair[0] == variable){return pair[1];}
  }
  return(false);
}

function haySesion() {
  auth.onAuthStateChanged(function (user) {
    if (user) { //si hay un usuario
      mostrarContador();
    }
    else {
      $(location).attr("href", "index.html");
    }
  });
}

haySesion();

function mostrarDatos() {
  let idPedido = getQueryVariable('id');
  let pedidoRef = db.ref('pedidoEntrada/'+idPedido);
  pedidoRef.on('value', function(snapshot) {
    let datos = snapshot.val();

    $('#numPedido').html("Pedido: " + idPedido);
    let diaCaptura = datos.encabezado.fechaCaptura.substr(0,2);
    let mesCaptura = datos.encabezado.fechaCaptura.substr(3,2);
    let añoCaptura = datos.encabezado.fechaCaptura.substr(6,4);
    let fechaCaptura = mesCaptura + '/' + diaCaptura + '/' + añoCaptura;
    moment.locale('es');
    let fechaCapturaMostrar = moment(fechaCaptura).format('LL');
    $('#fechaPedido').html("Recibido el "+fechaCapturaMostrar);
    $('#tienda').html('Tienda: ' + datos.encabezado.tienda);
    let detalle = datos.detalle;
    let trs = "";
    for(let producto in detalle) {
      trs += '<tr>' +
              '<td>' + detalle[producto].clave + '</td>' +
              '<td>' + detalle[producto].nombre + '</td>' +
              '<td>' + detalle[producto].degusPz + '</td>' +
              '<td>' + detalle[producto].pedidoPz + '</td>' +
              '<td>' + detalle[producto].totalPz + '</td>' +
              '<td>' + detalle[producto].totalKg + '</td>' +
              '<td>' + detalle[producto].precioUnitario + '</td>' +
              '<td>' + detalle[producto].unidad + '</td>' +
              '<td>' + detalle[producto].cambioFisico + '</td>' +
             '</tr>';
    }

    $('#tbodyProductos').empty().append(trs);
  });
}

function mostrarNotificaciones() {
  let usuario = auth.currentUser.uid;
  let notificacionesRef = db.ref('notificaciones/almacen/'+usuario+'/lista');
  notificacionesRef.on('value', function(snapshot) {
    let lista = snapshot.val();
    let lis = "";

    let arrayNotificaciones = [];
    for(let notificacion in lista) {
      arrayNotificaciones.push(lista[notificacion]);
    }

    for(let i in arrayNotificaciones) {
      let date = arrayNotificaciones[i].fecha;
      moment.locale('es');
      let fecha = moment(date, "MMMM DD YYYY, HH:mm:ss").fromNow();

      lis += '<li>' +
               '<a>' +
                '<div>' +
                  '<i class="fa fa-comment fa-fw"></i> ' + arrayNotificaciones[i].mensaje +
                    '<span class="pull-right text-muted small">'+fecha+'</span>' +
                '</div>' +
               '</a>' +
             '</li>';
    }

    $('#contenedorNotificaciones').empty().append('<li class="dropdown-header">Notificaciones</li><li class="divider"></li>');
    $('#contenedorNotificaciones').append(lis);
  });
}

function mostrarContador() {
  let uid = auth.currentUser.uid;
  let notificacionesRef = db.ref('notificaciones/almacen/'+uid);
  notificacionesRef.on('value', function(snapshot) {
    let cont = snapshot.val().cont;

    if(cont > 0) {
      $('#spanNotificaciones').html(cont).show();
    }
    else {
      $('#spanNotificaciones').hide();
    }
  });
}

function verNotificaciones() {
  let uid = auth.currentUser.uid;
  let notificacionesRef = db.ref('notificaciones/almacen/'+uid);
  notificacionesRef.update({cont: 0});
}

$('#campana').click(function() {
  verNotificaciones();
});

$(document).ready(function() {
  mostrarDatos();
  $('[data-toggle="tooltip"]').tooltip();
});

function generarPDF(){
    let contenido= document.getElementById('panel').innerHTML;
    let contenidoOriginal= document.body.innerHTML;
    document.body.innerHTML = contenido;
    window.print();
    document.body.innerHTML = contenidoOriginal;
}