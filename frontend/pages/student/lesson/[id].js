import {useRouter} from 'next/router'
import {useState,useEffect} from 'react'
import { Container, Box, Card, CardContent, Button, TextField, RadioGroup, FormControlLabel, Radio, Typography, Alert, CircularProgress, Divider, Paper, Snackbar } from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
export default function Lesson(){
  const router=useRouter()
  const {id,user} = router.query
  const [data,setData]=useState(null)
  const [answers,setAnswers]=useState({})
  const [taskText,setTaskText]=useState('')
  const [result,setResult]=useState(null)
  const [toastOpen,setToastOpen]=useState(false)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  useEffect(()=>{if(id)fetch(`${apiUrl}/api/lessons/${id}`).then(r=>r.json()).then(setData)},[id])
  useEffect(()=>{
    if(id && user) fetch(`${apiUrl}/api/lessons/view`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lesson_id:parseInt(id),student_id:parseInt(user)})})
    if(id && user) fetch(`${apiUrl}/api/lessons/${id}/status?student_id=${user}`).then(r=>r.json()).then(s=>{
      if(s){
        const newResult = {quiz: s.quiz || null, task: s.task || null}
        setResult(newResult)
        if(newResult.quiz && newResult.task){
          setToastOpen(true)
          setTimeout(()=>router.push(`/student/lessons?user=${user}`),1500)
        }
      }
    })
  },[id,user])
  if(!data) return <Container><Box className="centerLoader"><CircularProgress /></Box></Container>
  const submitQuiz=async()=>{
    const res = await fetch(`${apiUrl}/api/lessons/quiz/submit`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lesson_id:parseInt(id),student_id:parseInt(user),answers})})
    const j=await res.json()
    if(!res.ok) return setResult({error: j.error || 'Submission failed'})
    const status = await fetch(`${apiUrl}/api/lessons/${id}/status?student_id=${user}`).then(r=>r.json())
    const newResult = {quiz: status.quiz || {score: j.score}, task: status.task || null}
    setResult(newResult)
    if(newResult.quiz && newResult.task){
      setToastOpen(true)
      setTimeout(()=>router.push(`/student/lessons?user=${user}`),1500)
    }
  }
  const submitTask=async(taskId)=>{
    const res = await fetch(`${apiUrl}/api/lessons/task/submit`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({task_id:taskId,student_id:parseInt(user),content:taskText})})
    const j=await res.json()
    if(!res.ok) return setResult({error: j.error || 'Submission failed'})
    const status = await fetch(`${apiUrl}/api/lessons/${id}/status?student_id=${user}`).then(r=>r.json())
    const newResult = {quiz: status.quiz || null, task: status.task || {id: j.id, content: taskText}}
    setResult(newResult)
    if(newResult.quiz && newResult.task){
      setToastOpen(true)
      setTimeout(()=>router.push(`/student/lessons?user=${user}`),1500)
    }
  }

  return (
    <Container maxWidth="md">
      <Box sx={{mt:4,mb:4}}>
        <Typography variant="h4" sx={{mb:2}}>{data.lesson.title}</Typography>
        <Typography variant="body1" sx={{mb:3,color:'text.secondary'}}>{data.lesson.description}</Typography>
        <Button variant="contained" endIcon={<OpenInNewIcon />} href={data.lesson.video_url} target="_blank">Watch Video</Button>
        <Divider sx={{my:4}} />
        <Card sx={{mb:4,boxShadow:2}}>
          <CardContent>
            <Typography variant="h6" sx={{mb:2}}>Quiz</Typography>
            {result && result.error && <Alert severity="error" sx={{mb:2}}>{result.error}</Alert>}
            {result && result.quiz && <Alert severity="success" sx={{mb:2}}>Submitted! Your score: {result.quiz.score}</Alert>}
            {data.questions.map(q=> (
              <Box key={q.id} sx={{mb:3}}>
                <Typography variant="subtitle1" sx={{mb:1}}>{q.question_text}</Typography>
                <RadioGroup value={answers[q.id]||''} onChange={(e)=>setAnswers({...answers,[q.id]:e.target.value})}>
                  {['a','b','c','d'].map(k=> (
                    <FormControlLabel key={k} value={k} control={<Radio disabled={result && result.quiz} />} label={q['option_'+k]} />
                  ))}
                </RadioGroup>
              </Box>
            ))}
            <Button variant="contained" onClick={submitQuiz} disabled={result && result.quiz}>Submit Quiz</Button>
          </CardContent>
        </Card>
        <Card sx={{boxShadow:2}}>
          <CardContent>
            <Typography variant="h6" sx={{mb:2}}>Task</Typography>
            {result && result.task && <Alert severity="success" sx={{mb:2}}>Submitted! {result.task.mark!=null? `Mark: ${result.task.mark}` : 'Awaiting marking'}</Alert>}
            {data.tasks.map(t=> (
              <Box key={t.id}>
                <Typography variant="subtitle1" sx={{mb:2}}>{t.task_text}</Typography>
                <TextField fullWidth multiline rows={4} value={taskText} onChange={(e)=>setTaskText(e.target.value)} disabled={result && result.task} placeholder="Write your response here..." sx={{mb:2}} />
                <Button variant="contained" onClick={()=>submitTask(t.id)} disabled={result && result.task}>Submit Task</Button>
              </Box>
            ))}
          </CardContent>
        </Card>
        <Snackbar open={toastOpen} autoHideDuration={1500} onClose={()=>setToastOpen(false)} message="All parts completed — redirecting to lessons" />
      </Box>
    </Container>
  )
}
