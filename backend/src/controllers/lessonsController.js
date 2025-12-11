const lessonsService = require('../services/lessonsService')
async function list(req,res){
  try{
    const lessons = await lessonsService.getAllLessons()
    res.json(lessons)
  }catch(err){
    res.status(500).json({error:'Failed to fetch lessons'})
  }
}
async function detail(req,res){
  try{
    const {id} = req.params
    const data = await lessonsService.getLesson(id)
    res.json(data)
  }catch(err){
    res.status(500).json({error:'Failed to fetch lesson detail'})
  }
}
async function status(req,res){
  try{
    const {id} = req.params
    const {student_id} = req.query
    const s = await lessonsService.getStatus(id, student_id)
    res.json(s)
  }catch(err){
    res.status(500).json({error:'Failed to fetch status'})
  }
}
async function view(req,res){
  try{
    const {lesson_id, student_id} = req.body
    const id = await lessonsService.recordView(lesson_id, student_id)
    res.json({id})
  }catch(err){
    res.status(500).json({error:'Failed to record view'})
  }
}
async function submitQuiz(req,res){
  try{
    const {lesson_id, student_id, answers} = req.body
    const result = await lessonsService.submitQuiz(lesson_id, student_id, answers)
    res.json(result)
  }catch(err){
    if(err.message && err.message.includes('already submitted')) return res.status(409).json({error:err.message})
    res.status(500).json({error:'Failed to submit quiz'})
  }
}
async function submitTask(req,res){
  try{
    const {task_id, student_id, content} = req.body
    const result = await lessonsService.submitTask(task_id, student_id, content)
    res.json(result)
  }catch(err){
    if(err.message && err.message.includes('already submitted')) return res.status(409).json({error:err.message})
    res.status(500).json({error:'Failed to submit task'})
  }
}
async function attempts(req,res){
  try{
    const {id} = req.params
    const data = await lessonsService.getAttempts(id)
    res.json(data)
  }catch(err){
    res.status(500).json({error:'Failed to fetch attempts'})
  }
}
async function submissions(req,res){
  try{
    const {id} = req.params
    const data = await lessonsService.getSubmissions(id)
    res.json(data)
  }catch(err){
    res.status(500).json({error:'Failed to fetch submissions'})
  }
}
async function markTask(req,res){
  try{
    const {submission_id, mark} = req.body
    const changes = await lessonsService.markTask(submission_id, mark)
    res.json({changes})
  }catch(err){
    res.status(500).json({error:'Failed to mark task'})
  }
}
async function markQuiz(req,res){
  try{
    const {attempt_id, score} = req.body
    const changes = await lessonsService.markQuiz(attempt_id, score)
    res.json({changes})
  }catch(err){
    res.status(500).json({error:'Failed to mark quiz'})
  }
}
module.exports = {list, detail, status, view, submitQuiz, submitTask, attempts, submissions, markTask, markQuiz}
