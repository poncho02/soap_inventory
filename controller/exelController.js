'use strict'

const { Parser } = require('json2csv');
const request = require("request-promise");
const xml2js = require("xml2js");
const xmlParser = new xml2js.Parser();


exports.download = async (req, res, next) => {

	let body = getPayload("Obtener_Productos_Listado");

	let fields = [
		"id_producto",
		"id_marca",
		"marca",
		"id_familia",
		"familia",
		"id_categoria",
		"categoria",
		"id_subcategoria",
		"subcategoria",
		"codigo_proveedor",
		"descripcion",
		"activo",
		"activo_sentai",
		"codigo_barra",
		"precioLista",
		"nuevo",
		"fecha_nuevo"
	];

	request(body)
		.then(async(response) => {
			var data = await getDataResponse(response,"Listado");
			if(data && data.length){
				let csv = await generateCsv(data,fields);
				res.attachment('inventario-exel.csv')
				console.log("====> proceso terminado")
				return res.send(csv)
			}else if(data === false){
				return res.send({
					status: 200,
					message: "EXEL bloqueo el acceso al WS por exceder cantidad de intentos"
				})
			}else{
				return res.send({
					status: 200,
					message: "No hay datos de EXEL del NORTE para descargar"
				})
			}
		}).catch((err) => {
			console.log(err);
			return res.send({
				status: 500,
				message: JSON.stringify(err)
			})
		});
}

exports.getPricesAndStock = async (req, res, next) => {

	if(!req.query.ids || req.query.ids == ""){
		return res.send({
			status:200,
			message:"Falta enviar los IDS"
		})
	}

	var items = req.query.ids;
	items = items.split(",");
	items = items.slice(0,100);

	var _body = items.reduce((acc,el)=>{ acc += `<string>${el.trim()}</string>`; return acc },'');
	_body = `<Codigos>${_body}</Codigos>`;

	const body = getPayload("Obtener_Productos_PrecioYExistencia",_body);

	const fields = [
		"id_producto",
		"id_localidad",
		"localidad",
		"precio",
		"existencia"
	]

	try {
		const response = await request(body);
		
		if(response){
			var data = await getDataResponse(response,"PrecioYExistencia");

			if(data && data.length){
				let csv = await generateCsv(data,fields);
				res.attachment('stock-exel.csv')
				console.log("====> proceso terminado")
				return res.send(csv)
			}else if(data === false){
				return res.send({
					status: 200,
					message: "EXEL bloqueo el acceso al WS por exceder cantidad de intentos"
				})
			}else{
				return res.send({
					status: 200,
					message: "No hay datos de EXEL del NORTE para descargar"
				})
			}
		}else{ throw response; }
	} catch (error) {
		console.log(error);
		return res.send({
			status: 500,
			message: JSON.stringify(err)
		})
	}
}


//funcionaes auxiliares

async function generateCsv(data, fields){

	let opts = { fields };
	let parser = new Parser(opts);
  	let csv = parser.parse(data);
	
	return csv;
}

async function getDataResponse(response, key){
	
	var xmlDocument = await xmlParser.parseStringPromise(response);

	var items = xmlDocument["soap:Envelope"]["soap:Body"][0][`Obtener_Productos_${key}Response`][0][`Obtener_Productos_${key}Result`][0];
	
	if(items && items.includes("mensaje")){
		return false;
	}else{
		items = JSON.parse(items)
		return items.length ? items : [];
	}
}

function getPayload(op, body = ""){
	return {
		uri: `${process.env.URL_EXCEL}?op=${op}`,
		method: "POST",
		body: `<?xml version="1.0" encoding="utf-8"?>
				<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
				<soap:Body>
					<${op} xmlns="http://ws.exel.com.mx:8181/">
						<Usuario>${process.env.USER_EXCEL}</Usuario>
						<Password>${process.env.PASS_EXCEL}</Password>
						${body}
					</${op}>
				</soap:Body>
			</soap:Envelope>`,
		headers:{
			"Content-Type" : "text/xml",
			"Host" : "ws.exel.com.mx"
		}
	}
}