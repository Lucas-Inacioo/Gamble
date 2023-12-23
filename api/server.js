const express = require('express');
const app = express();
const port = 3001;

app.get('/api/crash-data', (req, res) => {
  // Aqui você implementará a lógica para retornar os dados do crash
  res.json({ data: /* Dados do Crash */ });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
