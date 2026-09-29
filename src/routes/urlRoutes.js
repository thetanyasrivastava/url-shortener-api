const express = require('express');
const controller = require('../controllers/urlController');
const validate = require('../middlewares/validate');
const { createUrlSchema, paginationSchema } = require('../validators/urlValidator');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.post('/', validate(createUrlSchema), asyncHandler(controller.create));
router.get('/', validate(paginationSchema, 'query'), asyncHandler(controller.list));
router.get('/:code', asyncHandler(controller.get));
module.exports = router;
