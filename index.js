require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const dns = require('dns');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Variables para almacenar los datos de URL
let urls = [];
let nextShortUrlId = 1;

// Ruta para acortar una URL
app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;

  // Verificar si la URL es válida utilizando new URL
  try {
    const pru = new URL(url);
    console.log(pru)
  } catch (error) {
    return res.json({ error: 'invalid url' });
  }

  // Verificar si la URL ya existe en la lista
  const existingUrl = urls.find((urlObj) => urlObj.original_url === url);
  if (existingUrl) {
    return res.json({
      original_url: existingUrl.original_url,
      short_url: existingUrl.short_url
    });
  }

  // Verificar la disponibilidad del host de la URL
  const urlParts = url.split('/');
  const host = urlParts[2];
  dns.lookup(host, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // Generar un nuevo ID de URL corta y almacenar los datos
    const shortUrl = nextShortUrlId;
    nextShortUrlId++;
    urls.push({
      original_url: url,
      short_url: shortUrl
    });

    // Responder con los datos de la URL acortada
    res.json({
      original_url: url,
      short_url: shortUrl
    });
  });
});

// Ruta para redirigir a la URL original
app.get('/api/shorturl/:shortUrl', (req, res) => {
  const { shortUrl } = req.params;

  // Buscar la URL en la lista
  const url = urls.find((urlObj) => urlObj.short_url === parseInt(shortUrl));
  if (!url) {
    return res.json({ error: 'invalid url' });
  }

  // Redireccionar a la URL original
  res.redirect(url.original_url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
