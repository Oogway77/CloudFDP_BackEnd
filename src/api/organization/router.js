const { Router } = require('express');

const { wrapList } = require('../../utils/wrapper');
const controller = wrapList(require('./controller'));
const validator = require('../../middleware/validator');
const schema = require('./schema');
const SessionChecker = require('../../middleware/sessionChecker');
const router = new Router();

router.use(SessionChecker.checkSession);
router.post('/create', validator(schema.createOrganizationSchema), controller.createOrganization)
router.post('/update', controller.updateOrganization)
router.get('/all', controller.getAllOrganization);
router.post('/select', validator(schema.selectOrganizationSchema), controller.selectOrganization);
router.get('/get', controller.getOrganization);
router.delete('/delete', validator(schema.selectOrganizationSchema), controller.deleteOrganization);
router.post('/update-status', validator(schema.updateOrganizationStatusSchema), controller.updateOrganizationStatus );
module.exports = router;
