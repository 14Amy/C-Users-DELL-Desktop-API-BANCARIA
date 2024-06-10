const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'api_bancaria'
});

exports.handler = async (event) => {
  const { numeroCuenta, monto } = JSON.parse(event.body);

  try {
    await connection.connect();

    // Realizar operación de depósito en la base de datos

    return {
      statusCode: 200,
      body: JSON.stringify('Depósito exitoso')
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify('Error al realizar el depósito')
    };
  } finally {
    await connection.end();
  }
};
