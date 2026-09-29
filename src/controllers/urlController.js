const urlService = require('../services/urlService');

async function create(req, res) {
  const result = await urlService.createShortUrl(req.body);
  res.status(201).json({ data: result });
}

async function redirect(req, res) {
  const destination = await urlService.resolveShortUrl(req.params.code);
  res.redirect(302, destination);
}

async function get(req, res) {
  res.json({ data: await urlService.getUrl(req.params.code) });
}

async function list(req, res) {
  res.json({ data: await urlService.listUrls(req.validatedQuery) });
}

module.exports = { create, redirect, get, list };
