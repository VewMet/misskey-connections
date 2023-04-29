const express = require('express');
const cors = require("cors");
const { updateFederation } = require('./sendNotifications');

const app = express();
const port = 3000;

const corsOptions = {
  origin: 'http://localhost:3030',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));
app.use(express.json());

app.post('/launch', async (req, res) => {
  const updateStatus = await updateFederation(req.body.idToken, req.body.federation, req.body.instances);
  res.send(updateStatus);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
