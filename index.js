module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify({ status: 'ok', test: 'minimal handler works' }));
};
