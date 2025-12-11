const usersService = require('../services/usersService')
async function list(req, res){
  try{
    const data = await usersService.getAllUsers()
    res.json(data)
  }catch(err){
    res.status(500).json({error: 'Failed to fetch users'})
  }
}
module.exports = {list}
