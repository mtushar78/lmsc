const teacherService = require('../services/teacherService')
async function engagement(req,res){
  try{
    const {id} = req.params
    const data = await teacherService.getEngagement(id)
    res.json(data)
  }catch(err){
    res.status(500).json({error:'Failed to fetch engagement'})
  }
}
module.exports = {engagement}
