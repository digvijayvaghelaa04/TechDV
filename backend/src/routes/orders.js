const express = require('express');
const {
    createOrder,
    getMyOrders,
    getAllOrders
} = require('../controllers/orders');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/', authorize('super_admin'), getAllOrders);

module.exports = router;
