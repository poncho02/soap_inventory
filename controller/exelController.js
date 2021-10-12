'use strict'

const { Parser } = require('json2csv');
const request = require("request-promise");
const xml2js = require("xml2js");
const xmlParser = new xml2js.Parser();


exports.download = async (req, res, next) => {

	let body = {
		uri: `${process.env.URL_EXCEL}?op=Obtener_Productos_Listado`,
		method: "POST",
		body: `<?xml version="1.0" encoding="utf-8"?>
				<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
				<soap:Body>
					<Obtener_Productos_Listado xmlns="http://ws.exel.com.mx:8181/">
						<Usuario>${process.env.USER_EXCEL}</Usuario>
						<Password>${process.env.PASS_EXCEL}</Password>
					</Obtener_Productos_Listado>
				</soap:Body>
			</soap:Envelope>`,
		headers:{
			"Content-Type" : "text/xml",
			"Host" : "ws.exel.com.mx"
		}
	};

	request(body)
		.then(async(response) => {
			var data = await getDataResponse(response);
			if(data && data.length){
				let csv = await generateCsv(data);
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

async function generateCsv(data){

	var fields = [
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

	let opts = { fields };
	let parser = new Parser(opts);
  	let csv = parser.parse(data);
	
	return csv;

}

async function getDataResponse(response){
	
	var xmlDocument = await xmlParser.parseStringPromise(response);

	var items = xmlDocument["soap:Envelope"]["soap:Body"][0][ "Obtener_Productos_ListadoResponse" ][0]["Obtener_Productos_ListadoResult"][0];
	
	if(items && items.includes("mensaje")){
		return false;
	}else{
		items = JSON.parse(items)
		return items.length ? items : [];
	}

}