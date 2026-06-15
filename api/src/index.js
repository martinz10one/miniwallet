const express = require('express');
const cors = require('cors');
const crearTablas = require('./seed');

const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', walletRoutes);

crearTablas().then(() => {
  app.listen(PORT, () => {
    console.log(`API corriendo en puerto ${PORT}`);
  });
});
