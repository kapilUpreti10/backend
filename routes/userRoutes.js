const express = require("express");
const userController = require("../controllers/userController");
const {protect,restrictRouteTo}=require("../controllers/authController");

const router = express.Router();

// getting all users data  and posting data
router
  .route("/")
  .get(protect,userController.getAllUsers)
  .post(userController.createUser);

  // updating usersAccount
  router.route("/updateMe").patch(protect,userController.updateMyData);

  // deleting usersAccount permanently
  router.route('/deleteMyAccount').delete(protect,userController.deleteMyaccount)

  // deactivating usersAccount
  router.route('/deactivateMyAccount').delete(protect,userController.deactivateMyAccount);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(protect,restrictRouteTo("admin","manager"),userController.deleteUser);

module.exports = router;
