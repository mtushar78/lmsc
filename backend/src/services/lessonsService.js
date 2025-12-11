const db = require('../../db')

async function getAllLessons(){
  const lessons = await db.lesson.findMany({
    include: { teacher: true, _count: { select: { lesson_views: true, quiz_attempts: true } } }
  })
  return lessons.map(l => ({
    id: l.id,
    title: l.title,
    description: l.description,
    video_url: l.video_url,
    teacher_id: l.teacher_id,
    published_at: l.published_at,
    teacher_name: l.teacher ? l.teacher.name : null,
    viewed_count: l._count ? l._count.lesson_views : 0,
    quiz_count: l._count ? l._count.quiz_attempts : 0
  }))
}

async function getLesson(id){
  const lid = parseInt(id)
  const lesson = await db.lesson.findUnique({ where: { id: lid }, include: { teacher: true } })
  const questions = await db.quizQuestion.findMany({ where: { lesson_id: lid } })
  const tasks = await db.lessonTask.findMany({ where: { lesson_id: lid } })
  return {lesson, questions, tasks}
}

async function getStatus(lessonId, studentId){
  const lid = parseInt(lessonId)
  const sid = parseInt(studentId)
  const quiz = await db.quizAttempt.findFirst({ where: { lesson_id: lid, student_id: sid } })
  const task = await db.taskSubmission.findFirst({ where: { student_id: sid, task: { lesson_id: lid } } })
  return { quiz: quiz || null, task: task || null }
}

async function recordView(lessonId, studentId){
  const rec = await db.lessonView.create({ data: { lesson_id: parseInt(lessonId), student_id: parseInt(studentId), viewed_at: new Date() } })
  return rec.id
}

async function submitQuiz(lessonId, studentId, answers){
  const lid = parseInt(lessonId)
  const sid = parseInt(studentId)
  const existing = await db.quizAttempt.findFirst({ where: { lesson_id: lid, student_id: sid } })
  if (existing) throw new Error('Student has already submitted quiz for this lesson')
  const questions = await db.quizQuestion.findMany({ where: { lesson_id: lid } })
  let score = 0
  for (const q of questions){
    const given = answers[q.id]
    if (given && given === q.correct_option) score++
  }
  const attempt = await db.quizAttempt.create({ data: { lesson_id: lid, student_id: sid, submitted_at: new Date(), score } })
  if (questions.length>0){
    const ansData = questions.map(q => ({ attempt_id: attempt.id, question_id: q.id, answer: answers[q.id] || '' }))
    await db.quizAnswer.createMany({ data: ansData })
  }
  return { id: attempt.id, score }
}

async function submitTask(taskId, studentId, content){
  const existing = await db.taskSubmission.findFirst({ where: { task_id: parseInt(taskId), student_id: parseInt(studentId) } })
  if (existing) throw new Error('Student has already submitted this task')
  const rec = await db.taskSubmission.create({ data: { task_id: parseInt(taskId), student_id: parseInt(studentId), submitted_at: new Date(), content } })
  return { id: rec.id }
}

async function getAttempts(lessonId){
  const attempts = await db.quizAttempt.findMany({ where: { lesson_id: parseInt(lessonId) }, include: { student: true, answers: { include: { question: true } } } })
  return attempts.map(a => ({
    id: a.id,
    lesson_id: a.lesson_id,
    student_id: a.student_id,
    student_name: a.student ? a.student.name : null,
    submitted_at: a.submitted_at,
    score: a.score,
    answers: a.answers.map(ans => ({ id: ans.id, question_id: ans.question_id, answer: ans.answer, question_text: ans.question ? ans.question.question_text : null, option_a: ans.question ? ans.question.option_a : null, option_b: ans.question ? ans.question.option_b : null, option_c: ans.question ? ans.question.option_c : null, option_d: ans.question ? ans.question.option_d : null, correct_option: ans.question ? ans.question.correct_option : null }))
  }))
}

async function getSubmissions(lessonId){
  const subs = await db.taskSubmission.findMany({ where: { task: { lesson_id: parseInt(lessonId) } }, include: { student: true, task: true } })
  return subs.map(s => ({ id: s.id, task_id: s.task_id, student_id: s.student_id, student_name: s.student ? s.student.name : null, content: s.content, submitted_at: s.submitted_at, mark: s.mark }))
}

async function markTask(submissionId, mark){
  const res = await db.taskSubmission.update({ where: { id: parseInt(submissionId) }, data: { mark: mark } })
  return res ? 1 : 0
}

async function markQuiz(attemptId, score){
  const res = await db.quizAttempt.update({ where: { id: parseInt(attemptId) }, data: { score: score } })
  return res ? 1 : 0
}

module.exports = {
  getAllLessons, getLesson, getStatus, recordView, submitQuiz, submitTask, getAttempts, getSubmissions, markTask, markQuiz
}
