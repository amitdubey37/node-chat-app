const express = require('express');
const path = require('path');

const port = process.env.PORT || 3000

const publicPath = path.join(__dirname, '../public')
const app = express();
app.use(express.static(publicPath));
app.get('/', (req, res) => {
  res.send('index.html');
});

app.listen(port, () => {
  console.log('server is running at port ' + port)
})
