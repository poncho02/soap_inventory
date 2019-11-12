'use strict'

const { Parser } = require('json2csv');
const soap = require('soap');


exports.download = async (req, res, next) => {
	

	  var url = process.env.url;
	  var args = { cliente: process.env.client_id, llave: process.env.key_id };

	  soap.createClient(url, function(err, client) {
	      client.ObtenerListaArticulos(args, async function(err, result) {

	          if(result.resultado && result.resultado.datos && result.resultado.datos.item && result.resultado.datos.item.length){
	          	
	          	let resultData = await processData(result.resultado.datos.item);

	          	let csv = await generateCsv(resultData);

	          	res.attachment('inventario.csv')

	          	console.log("====> proceso terminado")

	          	return res.send(csv)

	          }else{
	          	return res.send("No hay datos")
	          }

	      });
	  });

}

function processData(items){

	var contenedor = [],
		keys_almacenes = [];

	for (var item of items) {

		let fila = {};

		fila['sku'] = (item.sku && item.sku.$value) ? item.sku.$value : ''
		fila['descripcion'] = (item.descripcion && item.descripcion.$value) ? item.descripcion.$value : ''
		fila['skuFabricante'] = (item.skuFabricante && item.skuFabricante.$value) ? item.skuFabricante.$value : ''
		fila['seccion'] = (item.seccion && item.seccion.$value) ? item.seccion.$value : ''
		fila['linea'] = (item.linea && item.linea.$value) ? item.linea.$value : ''
		fila['marca'] = (item.marca && item.marca.$value) ? item.marca.$value : ''
		fila['serie'] = (item.serie && item.serie.$value) ? item.serie.$value : ''
		fila['precio'] = (item.precio && item.precio.$value) ? item.precio.$value : ''
		fila['peso'] = (item.peso && item.peso.$value) ? item.peso.$value : ''
		fila['alto'] = (item.alto && item.alto.$value) ? item.alto.$value : ''
		fila['largo'] = (item.largo && item.largo.$value) ? item.largo.$value : ''
		fila['ancho'] = (item.ancho && item.ancho.$value) ? item.ancho.$value : ''
		fila['moneda'] = (item.moneda && item.moneda.$value) ? item.moneda.$value : ''


		if(item.inventario && item.inventario.item.length){
			for (let inv of item.inventario.item) {
				let key = 'existencia_almacen_' + inv.almacen.$value; 
				fila[key] = (inv.existencia) ? inv.existencia.$value : 0;
				if(!keys_almacenes.includes(key))
					keys_almacenes.push(key);
			}
		}

		contenedor.push(fila)
	}

	return {
		data : contenedor,
		keysAlmacenes : keys_almacenes
	};
}

async function generateCsv(data){

	var fields = ['sku', 'descripcion', 'skuFabricante', 'seccion', 'linea', 'marca', 'serie', 'precio', 'peso', 'alto' ,'largo', 'ancho', 'moneda'].concat(data.keysAlmacenes);

	let opts = { fields };
	let parser = new Parser(opts);
  	let csv = parser.parse(data.data);
	
	return csv;

}