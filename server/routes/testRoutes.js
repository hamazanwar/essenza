const express=require("express")
const router=express.Router();
const {testAPI}=require("../controllers/testController")

router.get("/",testAPI)

module.exports=router