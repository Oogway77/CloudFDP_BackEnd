const { Router } = require('express');

const { wrapList } = require('../../utils/wrapper');
const passport = require('./strategy');
const controller = wrapList(require('./controller'));
const validator = require('../../middleware/validator');
const schema = require('./schema');
const SessionChecker = require('../../middleware/sessionChecker');
const router = new Router();

router.post('/', validator(schema.signup), controller.createUserWithoutAzure);
router.post('/create-admin', validator(schema.createAdminSchema), controller.createAdmin);
router.post('/signup-token', validator(schema.getEmailByToken), controller.getEmailForSignup);
router.post('/signup', validator(schema.signup), controller.createUserInvited);
router.post('/signin', validator(schema.signin), controller.signIn);
router.post('/reset-pswd-mail', validator(schema.inviteUser), controller.sendResetPasswordMail);

router.use(SessionChecker.checkSession);
router.post('/invite-user', validator(schema.inviteUser), controller.sendInviteEmail);
router.post('/profile', validator(schema.setProfile), controller.setAccountProfile);
router.get('/profile', controller.getAccountProfile);
router.post('/logout', controller.logoutUser);
router.get('/allusers', controller.getUsers);
router.post('/getuser', controller.getUser);
router.post('/update-status', validator(schema.updateUserStatus), controller.updateUserStatus);
router.post('/recent-activities', validator(schema.getRecentActivities), controller.getRecentActivities);
router.delete('/delete', validator(schema.IdSchema), controller.deleteUser);
router.post('/update-role', validator(schema.updateRole), controller.UpdateRole);
router.get('/superadmin/dashboard', controller.superAdminDashboard);
router.get('/userdashboard', controller.userDashboard);
router.post('/org-users', validator(schema.OrganizationIdSchema), controller.getUsersOfOrganization)
router.post('/activity', validator(schema.IdSchema), controller.recentActivity);
router.post('/update-profile', controller.updateUserProfile);

module.exports = router;
