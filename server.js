require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3021;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexió a MongoDB
const uri = process.env.MONGO_URI;

const clientOptions = {
  family: 4 
};

console.log("Intentant connectar a:", uri);

mongoose.connect(uri, clientOptions)
  .then(() => {
    console.log('✅ Connectat a MongoDB');
  })
  .catch(err => {
    console.error('❌ Error de connexió a MongoDB:', err.message);
  });

// Esquema adaptat als camps dels jugadors
const jugadorSchema = new mongoose.Schema({
  nom: String,
  cognom: String,
  equip: String,
  posicio: String,
  dorsal: Number,
  dataFitxatge: Date,
  gols: Number,
  nacionalitat: String
}, { versionKey: false });
const Jugador = mongoose.model('Jugador', jugadorSchema);



/**
 * ENDPOINTS
 */

// Simple comprovacio que l'api esta funcionant
app.get('/', (req, res) => {
  res.send('API de Jugadors de Futbol en funcionament ⚽');
});

// 1. GET /list
app.get('/list', async (req, res) => {
  try {
    const jugadors = await Jugador.find();
    res.status(200).json(jugadors);
  } catch (err) {
    res.status(500).json({ message: 'Error al llistar jugadors', error: err.message });
  }
});

// 2. POST /add
app.post('/add', async (req, res) => {
  try {
    const nouJugador = new Jugador(req.body);
    const guardat = await nouJugador.save();
    res.status(201).json(guardat);
  } catch (err) {
    res.status(400).json({ message: 'Error al afegir el jugador', error: err.message });
  }
});

// 3. GET /list/:dataini/:datafi
app.get('/list/:dataini/:datafi', async (req, res) => {
  try {
    const { dataini, datafi } = req.params;
    const jugadors = await Jugador.find({
      dataFitxatge: { 
        $gte: new Date(dataini), 
        $lte: new Date(datafi) 
      }
    });
    res.status(200).json(jugadors);
  } catch (err) {
    res.status(500).json({ message: 'Error en el filtre de dates', error: err.message });
  }
});

// 4. PUT /update
app.put('/update', async (req, res) => {
  try {
    const { _id, ...dades } = req.body;
    const actualitzat = await Jugador.findByIdAndUpdate(_id, dades, { new: true });
    if (!actualitzat) return res.status(404).json({ message: 'Jugador no trobat' });
    res.status(200).json(actualitzat);
  } catch (err) {
    res.status(400).json({ message: 'Error al actualitzar', error: err.message });
  }
});

// 5. DELETE /delete
app.delete('/delete', async (req, res) => {
  try {
    const { _id } = req.body;
    const eliminat = await Jugador.findByIdAndDelete(_id);
    if (!eliminat) return res.status(404).json({ message: 'Jugador no trobat' });
    res.status(200).json({ message: 'Jugador eliminat correctament' });
  } catch (err) {
    res.status(400).json({ message: 'Error al eliminar', error: err.message });
  }
});

// Inicia el servidor
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor corrent a http://localhost:${port}`);
});