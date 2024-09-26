const { userCardsave, getUsercardByid, makepaymentwithsaveCard } = require("../controllers/userCardSaveMethodConroller");



const saveCradRoute = require("express").Router();

saveCradRoute.post("/store-card",userCardsave);
saveCradRoute.get("/list-cards",getUsercardByid);
saveCradRoute.post('/make-payment',makepaymentwithsaveCard)
// Route to capture payment

module.exports = saveCradRoute;
