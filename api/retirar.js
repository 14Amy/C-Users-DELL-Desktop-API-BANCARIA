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
    await new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Realizar operación de retiro en la base de datos
    const sql = `UPDATE CuentaBancaria SET saldo = saldo - ? WHERE numeroCuenta = ?`;
    await new Promise((resolve, reject) => {
      connection.query(sql, [monto, numeroCuenta], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    return {
      statusCode: 200,
      body: JSON.stringify('Retiro exitoso')
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify('Error al realizar el retiro')
    };
  } finally {
    connection.end();
  }
};
