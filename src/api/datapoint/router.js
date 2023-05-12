const { Router } = require('express');

const { wrapList } = require('../../utils/wrapper');
const controller = wrapList(require('./controller'));
const validator = require('../../middleware/validator');
const schema = require('./schema');
const SessionChecker = require('../../middleware/sessionChecker');
const router = new Router();
router.post('/status', controller.getDataPointStatus);
router.post('/rg-info', controller.getListByRG);

router.use(SessionChecker.checkSession);
router.post('/create', validator(schema.createDataPoint), controller.createDataPoint);
router.post('/update', validator(schema.updateDataPoint), controller.updateDataPoint);
router.get('/all', controller.getAllDataPoint);
router.post('/select', validator(schema.selectDataPoint), controller.selectDataPoint);
router.delete('/delete', validator(schema.deleteDataPoint), controller.deleteDataPoint);
router.post('/update-status', validator(schema.updateStatus), controller.updateDataPointStatus );
router.post('/org-datapoint', validator(schema.selectOrgDataPoint), controller.getDataPointOfOrganization);
router.post('/recent-activities', validator(schema.getRecentActivities), controller.getRecentActivities);
module.exports = router;
