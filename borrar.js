/* IMSS Movimientos Afiliatorios - Accepti Contadores
   imss.js v2.0 - 5 pasos con datos del patron

   ANTES DE SUBIR reemplaza:
   TU_WEBHOOK_IMSS -> URL del escenario IMSS en Make
*/
var WEBHOOK_IMSS = 'https://hook.us2.make.com/x36egy1yjz501hcinnfavgdq8c1ci6uh';

var paso = 1;
var movimiento = '';

var CAMPOS = {
  alta:      ['f-nss','f-nombre','f-curp','f-rfc','f-nacimiento','f-sexo','f-umf',
               'f-salario','f-tipo-sal','f-tipo-trab','f-jornada','f-depto','f-puesto','f-cp'],
  reingreso: ['f-nss','f-nombre','f-curp','f-rfc',
               'f-salario','f-tipo-sal','f-tipo-trab','f-jornada','f-depto','f-puesto'],
  baja:      ['f-nss','f-nombre-simple','f-motivo-baja'],
  salario:   ['f-nss','f-nombre-simple','f-salario','f-tipo-sal']
};

var PLAZO = {
  alta:      '5 dias habiles desde el inicio de labores del trabajador.',
  reingreso: '5 dias habiles desde el reingreso a actividades.',
  baja:      '5 dias habiles desde la terminacion de la relacion laboral.',
  salario:   'Salario fijo: 5 dias habiles. Salario variable: primeros 5 dias de meses nones.'
};

var HINT_FECHA = {
  alta:      'Fecha de inicio de labores del trabajador',
  reingreso: 'Fecha de reingreso a actividades',
  baja:      'Ultimo dia laborado (por el que se pago salario)',
  salario:   'Fecha en que entra en vigor el nuevo salario'
};

document.addEventListener('DOMContentLoaded', function() {
  // Logo fallback
  var img = document.getElementById('logo-img');
  if (img) { img.onerror = function() { img.style.display='none'; document.getElementById('logo-fallback').style.display='grid'; }; }

  // Seleccion de movimiento con event delegation
  document.querySelector('.mov-grid').addEventListener('click', function(e) {
    var card = e.target.closest('.mov-card');
    if (!card) return;
    var tipo = card.id.replace('mov-', '');
    selMov(tipo);
  });

  // Navegacion
  document.getElementById('btn-next-1').addEventListener('click', function() { goNext(1); });
  document.getElementById('btn-next-2').addEventListener('click', function() { goNext(2); });
  document.getElementById('btn-next-3').addEventListener('click', function() { goNext(3); });
  document.getElementById('btn-next-4').addEventListener('click', function() { goNext(4); });
  document.getElementById('btn-prev-2').addEventListener('click', function() { goPrev(2); });
  document.getElementById('btn-prev-3').addEventListener('click', function() { goPrev(3); });
  document.getElementById('btn-prev-4').addEventListener('click', function() { goPrev(4); });
  document.getElementById('btn-prev-5').addEventListener('click', function() { goPrev(5); });
  document.getElementById('btn-enviar').addEventListener('click', function() { enviar(); });

  // Validacion en tiempo real
  document.getElementById('reg_patronal').addEventListener('input', function() { this.value=this.value.toUpperCase(); clrE('reg_patronal'); });
  document.getElementById('nombre_patron').addEventListener('input', function() { clrE('nombre_patron'); });
  document.getElementById('rfc_patron').addEventListener('input', function() { this.value=this.value.toUpperCase(); });
  document.getElementById('email').addEventListener('input', function() { clrE('email'); });
  document.getElementById('nss').addEventListener('input', function() { clrE('nss'); });
  document.getElementById('nombre').addEventListener('input', function() { clrE('nombre'); });
  document.getElementById('curp').addEventListener('input', function() { this.value=this.value.toUpperCase(); clrE('curp'); });
  document.getElementById('rfc').addEventListener('input', function() { this.value=this.value.toUpperCase(); });
  document.getElementById('nacimiento').addEventListener('input', function() { clrE('nacimiento'); });
  document.getElementById('fecha_mov').addEventListener('input', function() { clrE('fecha_mov'); });
  document.getElementById('motivo_baja').addEventListener('change', function() { clrE('motivo_baja'); });
  document.getElementById('salario').addEventListener('input', function() { clrE('salario'); });
});

function selMov(tipo) {
  movimiento = tipo;
  var tipos = ['alta','reingreso','baja','salario'];
  for (var i=0; i<tipos.length; i++) {
    var card = document.getElementById('mov-' + tipos[i]);
    var badge = document.getElementById('badge-' + tipos[i]);
    card.classList.remove('selected');
    badge.textContent = '';
  }
  document.getElementById('mov-' + tipo).classList.add('selected');
  document.getElementById('badge-' + tipo).textContent = '\u2713';
  var alert = document.getElementById('plazo-alert');
  document.getElementById('plazo-txt').textContent = 'Plazo: ' + (PLAZO[tipo] || '');
  alert.classList.add('show');
}

function aplicarCampos() {
  var todos = ['f-nss','f-nombre','f-nombre-simple','f-curp','f-rfc','f-nacimiento',
               'f-sexo','f-umf','f-motivo-baja','f-salario','f-tipo-sal',
               'f-tipo-trab','f-jornada','f-depto','f-puesto','f-cp'];
  for (var i=0; i<todos.length; i++) {
    var el = document.getElementById(todos[i]);
    if (el) el.classList.add('hide');
  }
  var mostrar = CAMPOS[movimiento] || [];
  for (var j=0; j<mostrar.length; j++) {
    var el2 = document.getElementById(mostrar[j]);
    if (el2) el2.classList.remove('hide');
  }
  var hf = document.getElementById('hint-fecha');
  if (hf) hf.textContent = HINT_FECHA[movimiento] || 'Fecha del movimiento';
  var titulos = {alta:'Datos del Trabajador (Alta)',reingreso:'Datos del Trabajador (Reingreso)',baja:'Identificacion del Trabajador',salario:'Identificacion del Trabajador'};
  document.getElementById('card3-title').textContent = titulos[movimiento] || 'Datos del Trabajador';
  var subs = {alta:'Informacion completa para el alta en el IMSS',reingreso:'Datos del trabajador que regresa a laborar',baja:'Solo se requieren datos basicos para la baja',salario:'Identifica al trabajador cuyo salario se modifica'};
  document.getElementById('card3-sub').textContent = subs[movimiento] || '';
  var t4 = {alta:'Datos Laborales del Alta',reingreso:'Datos Laborales del Reingreso',baja:'Datos de la Baja',salario:'Nueva Informacion Salarial'};
  document.getElementById('card4-title').textContent = t4[movimiento] || 'Datos Laborales';
}

function goNext(from) {
  if (!validar(from)) return;
  if (from === 1) aplicarCampos();
  paso = from + 1;
  if (paso === 5) armarResumen();
  actualizarUI();
  window.scrollTo({top:0,behavior:'smooth'});
}
function goPrev(from) {
  paso = from - 1;
  actualizarUI();
  window.scrollTo({top:0,behavior:'smooth'});
}
function actualizarUI() {
  for (var i=1;i<=5;i++) {
    var c=document.getElementById('card'+i);
    if(i===paso) c.classList.add('active'); else c.classList.remove('active');
    var t=document.getElementById('st'+i);
    var n=document.getElementById('sn'+i);
    t.classList.remove('active','done');
    if(i===paso){t.classList.add('active');n.textContent=i;}
    else if(i<paso){t.classList.add('done');n.textContent='\u2713';}
    else{n.textContent=i;}
  }
}

function validar(p) {
  var ok=true;
  if (p===1) {
    if (!movimiento) { alert('Selecciona el tipo de movimiento para continuar.'); return false; }
  }
  if (p===2) {
    if (g('reg_patronal').trim().length < 8) { marcarErr('reg_patronal'); ok=false; }
    if (g('nombre_patron').trim().length < 2) { marcarErr('nombre_patron'); ok=false; }
    var em=g('email');
    if (!em||em.indexOf('@')<1) { marcarErr('email'); ok=false; }
  }
  if (p===3) {
    var nss=g('nss').replace(/\s/g,'');
    if (nss.length!==11) { marcarErr('nss'); ok=false; }
    if (!esOculto('f-nombre') && g('nombre').trim().length<3) { marcarErr('nombre'); ok=false; }
    if (!esOculto('f-curp') && g('curp').trim().length!==18) { marcarErr('curp'); ok=false; }
    if (!esOculto('f-nacimiento') && !g('nacimiento')) { marcarErr('nacimiento'); ok=false; }
  }
  if (p===4) {
    if (!g('fecha_mov')) { marcarErr('fecha_mov'); ok=false; }
    if (!esOculto('f-motivo-baja') && !g('motivo_baja')) { marcarErr('motivo_baja'); ok=false; }
    if (!esOculto('f-salario') && (!g('salario')||parseFloat(g('salario'))<=0)) { marcarErr('salario'); ok=false; }
  }
  if (p===5) {
    if (!document.getElementById('acepto').checked) { alert('Debes aceptar los terminos para continuar.'); return false; }
  }
  return ok;
}

function esOculto(id) {
  var el=document.getElementById(id);
  return !el||el.classList.contains('hide');
}
function marcarErr(id) {
  var el=document.getElementById(id); if(el) el.classList.add('err');
  var em=document.getElementById('e-'+id); if(em) em.style.display='block';
}
function clrE(id) {
  var el=document.getElementById(id); if(el) el.classList.remove('err');
  var em=document.getElementById('e-'+id); if(em) em.style.display='none';
}
function g(id) { var el=document.getElementById(id); return el?el.value:''; }

function armarResumen() {
  var tsal=document.querySelector('input[name=tipo_sal]:checked');
  var nombres={alta:'Alta de Trabajador',reingreso:'Reingreso',baja:'Baja de Trabajador',salario:'Modificacion de Salario'};
  var filas=[
    {l:'Tipo de movimiento', v:nombres[movimiento]||movimiento, big:true, full:true},
    {l:'Registro Patronal',  v:g('reg_patronal')},
    {l:'Patron / Empresa',   v:g('nombre_patron')},
    {l:'RFC Patron',         v:g('rfc_patron')||'-'},
    {l:'Correo',             v:g('email')},
    {l:'NSS Trabajador',     v:g('nss')},
    {l:'Nombre',             v:g('nombre')||g('nombre_simple')||'-'},
    {l:'CURP',               v:g('curp')||'-'},
    {l:'Fecha del movimiento',v:g('fecha_mov')},
    {l:'Motivo de baja',     v:g('motivo_baja')||'-'},
    {l:'Salario Diario',     v:g('salario')?'$'+parseFloat(g('salario')).toFixed(2):'-'},
    {l:'Tipo de salario',    v:tsal?(['Fijo','Variable','Mixto'][tsal.value]||tsal.value):'-'}
  ];
  var html='';
  for(var i=0;i<filas.length;i++){
    var d=filas[i];
    html+='<div class="ri'+(d.full?' full':'')+'"><div class="ril">'+d.l+'</div><div class="riv'+(d.big?' mov':'')+'">'+( d.v||'\u2014')+'</div></div>';
  }
  document.getElementById('resumen').innerHTML=html;
}

function enviar() {
  if(!document.getElementById('acepto').checked){alert('Debes aceptar los terminos.');return;}
  var folio='IMSS-'+new Date().getFullYear()+'-'+(Math.floor(Math.random()*90000)+10000);
  var tsal=document.querySelector('input[name=tipo_sal]:checked');
  var sexo=document.querySelector('input[name=sexo]:checked');
  var data={
    folio:folio, timestamp:new Date().toISOString(),
    tipo_movimiento:movimiento,
    patron:{
      registro_patronal:g('reg_patronal').toUpperCase(),
      nombre:g('nombre_patron'),
      rfc:g('rfc_patron').toUpperCase(),
      telefono:g('tel_patron'),
      email:g('email')
    },
    trabajador:{
      nss:g('nss').replace(/\s/g,''),
      nombre:g('nombre')||g('nombre_simple'),
      curp:g('curp'),
      rfc:g('rfc'),
      fecha_nacimiento:g('nacimiento'),
      sexo:sexo?sexo.value:'',
      umf:g('umf')
    },
    movimiento:{
      fecha:g('fecha_mov'),
      motivo_baja:g('motivo_baja'),
      salario_diario:g('salario')?parseFloat(g('salario')).toFixed(2):'',
      tipo_salario:tsal?tsal.value:'',
      tipo_trabajador:g('tipo_trab'),
      jornada:g('jornada'),
      departamento:g('departamento'),
      puesto:g('puesto'),
      cp_trabajador:g('cp'),
      notas:g('notas')
    }
  };
  fetch(WEBHOOK_IMSS,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
    .catch(function(){console.warn('Webhook no configurado');});
  for(var i=1;i<=5;i++) document.getElementById('card'+i).classList.remove('active');
  document.getElementById('success').classList.add('active');
  document.getElementById('folio-num').textContent=folio;
  window.scrollTo({top:0,behavior:'smooth'});
}
