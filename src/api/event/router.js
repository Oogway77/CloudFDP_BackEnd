const { Router } = require('express');

const { wrapList } = require('../../utils/wrapper');
const controller = wrapList(require('./controller'));
const validator = require('../../middleware/validator');
const schema = require('./schema');
const SessionChecker = require('../../middleware/sessionChecker');
const router = new Router();

router.use(SessionChecker.checkSession);
router.post('/create', validator(schema.createEvent), controller.createEvent);
router.post('/update', validator(schema.updateEvent), controller.updateEvent);
router.post('/events', validator(schema.getEvents), controller.getEvents);
router.post('/event', validator(schema.getEvent), controller.selectEvent);

module.exports = router;
