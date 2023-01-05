//Packages
const app = require('./app');

//Setting PORT variable
const PORT = process.env.PORT || 8000

//Listening app on PORT
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
