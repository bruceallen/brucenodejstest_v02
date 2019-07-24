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
      const result2 = await client.query("DROP TABLE phrase_table");    
      res.send("Database cleared");
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

  .get('/dbread', async (req, res) => {
    try {
      bigphrase = 'DBREAD<br />';
      const client = await pool.connect()

      client.query("SELECT * FROM test_table", function (err, result, fields) {
        if (err) {
          console.error("UHUH");
        } else {
          currentitem = result.rows[0];          
          bigphrase = bigphrase + '<b>count:</b><br /><br />Count: ' + currentitem.count + '<br />';    
        }
      })
      
      client.query("SELECT * FROM phrase_table", function (perr, presult, pfields) {
        if (perr) {
          console.error("UHUH");
        } else {
          bigphrase = bigphrase + '<b>phrase list:</b>';
          currentphraseitem = presult.rows[0];
          if (currentphraseitem) {
            bigphrase = bigphrase + 'phraze iz ' + currentphraseitem.count;    
          } else {
            bigphrase = bigphrase + 'iz empty ';
          }
        }
      })

      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(bigphrase);
      res.end();

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
      const result2 = await client.query("CREATE TABLE phrase_table(id SERIAL PRIMARY KEY, phrase TEXT)");
      res.send("Created tables inside database");
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

  .get('/dbadd', async (req, res) => {
    try {
      const client = await pool.connect()
      client.query("SELECT * FROM test_table", function (err, result, fields) {
        if (err) {
          console.error("UHUH");
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.write('<b>ERROR ADDING</b>');
          res.end();
        } else {
          currentitem = result.rows[0];
          newcount = currentitem.count + 1;
          newphrase = "'LITTLE TURTLE NUMBER " + newcount + "'";
          
          const result3 = client.query("UPDATE test_table SET count = " + newcount + " WHERE id = 1");
          const result4 = client.query("INSERT INTO phrase_table(id, count) VALUES(" + newcount + ", " + newphrase + " )");
          
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.write('<b>Hey there!</b><br /><br />This is the default response. You are visitor #: ' + newcount);
          res.end();
          client.release();
        }
      })      
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })

  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
