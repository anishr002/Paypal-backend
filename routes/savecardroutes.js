const { userCardsave, getUsercardByid, makepaymentwithsaveCard, makepaymentwithsaveCardV2 } = require("../controllers/userCardSaveMethodConroller");



const saveCradRoute = require("express").Router();

saveCradRoute.post("/store-card",userCardsave);
saveCradRoute.get("/list-cards",getUsercardByid);
saveCradRoute.post('/make-payment',makepaymentwithsaveCard)
saveCradRoute.post('/make-payment/v2',makepaymentwithsaveCardV2)
// Route to capture payment

module.exports = saveCradRoute;
