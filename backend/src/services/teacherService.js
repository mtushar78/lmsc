const db = require('../../db')
async function getEngagement(lessonId){
  const sid = parseInt(lessonId)
  const students = await db.student.findMany()
  const results = []
  for (const s of students){
    const viewed = await db.lessonView.findFirst({ where: { lesson_id: sid, student_id: s.id } }) ? true : false
    const quiz = await db.quizAttempt.findFirst({ where: { lesson_id: sid, student_id: s.id } })
    const task = await db.taskSubmission.findFirst({ where: { student_id: s.id, task: { lesson_id: sid } } })
    results.push({ student: s, viewed, quiz: quiz || null, task: task || null })
  }
  return results
}
module.exports = {getEngagement}
