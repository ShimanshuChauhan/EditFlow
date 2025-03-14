import express from 'express';

const app = express();
app.use(express.json());

app.get('/home', (req, res) => {
  res.send('Hello World');
});

app.get('*', (req, res, next) => {
  res.send("Cannot GET " + req.url);
});

export default app;