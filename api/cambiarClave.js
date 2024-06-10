const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'api_bancaria'
});

exports.handler = async (event) => {
  const { tarjetaDebito, nuevaClave } = JSON.parse(event.body);

  try {
    await new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Realizar operación de cambio de clave en la base de datos
    const sql = `UPDATE CuentaBancaria SET claveTarjeta = ? WHERE tarjetaDebito = ?`;
    await new Promise((resolve, reject) => {
      connection.query(sql, [nuevaClave, tarjetaDebito], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    return {
      statusCode: 200,
      body: JSON.stringify('Cambio de clave exitoso')
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify('Error al cambiar la clave')
    };
  } finally {
    connection.end();
  }
};
