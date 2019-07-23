const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))

  .get('/db', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM test_table');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

  .get('/dbclear', async (req, res) => {
    try {
      const client = await pool.connect()
      const result1 = await client.query("DROP TABLE test_table");    
      res.send("Drop that DB man");
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

  .get('/dbread', async (req, res) => {
    try {
      const client = await pool.connect()
      client.query("SELECT * FROM test_table", function (err, result, fields) {
        if (err) {
          console.error("UHUH");
        } else {
          currentitem = result.rows[0];
          res.send("Current count:" + currentitem.count);
        }
      })
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

  .get('/dbcreate', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query("CREATE TABLE test_table(id SERIAL PRIMARY KEY, count INT)");
      res.send("MADE IT dude!");
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

  .get('/dbadd', async (req, res) => {
    try {
      const client = await pool.connect()
      client.query("SELECT * FROM test_table", function (err, result, fields) {
        if (err) {
          console.error("UHUH");
        } else {
          currentitem = result.rows[0];
          newcount = currentitem.count + 1;
        }
      })
 
      const result1 = await client.query("DROP TABLE test_table");
      const result2 = await client.query("CREATE TABLE test_table(id SERIAL PRIMARY KEY, count INT)");
      const result3 = await client.query("INSERT INTO test_table(id, count) VALUES(1," + newcount + ")");

      res.send("Old count:" + currentitem.count + "New count:" + newcount);

      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

  .get('/dbinsert', async (req, res) => {
    try {
      const client = await pool.connect()
      const oldcount = await client.query('SELECT * FROM test_table');
      
      const result = await client.query("INSERT INTO test_table(id, count) VALUES(1, 1)");
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
