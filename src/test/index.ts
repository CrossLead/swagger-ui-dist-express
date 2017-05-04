import createServer from '../';

const app = createServer({
  url: "http://petstore.swagger.io/v2/swagger.json"
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});