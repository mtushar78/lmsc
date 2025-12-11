const db = require('../../db')
async function getAllUsers(){
  const students = await db.student.findMany()
  const teachers = await db.teacher.findMany()
  return {students, teachers}
}
module.exports = {getAllUsers}
