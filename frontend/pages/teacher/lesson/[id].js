import {useRouter} from 'next/router'
import useSWR from 'swr'
import { Container, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Card, CardContent, CardActions, Button, TextField, Typography, CircularProgress, Divider, Chip, Stack } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
const fetcher = url => fetch(url).then(r=>r.json())
export default function Lesson(){
  const router = useRouter()
  const {id,user} = router.query
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  const {data} = useSWR(id?`${apiUrl}/api/teacher/lessons/${id}/engagement` : null, fetcher)
  const {data: attempts} = useSWR(id?`${apiUrl}/api/lessons/${id}/attempts`:null, fetcher)
  const {data: subs} = useSWR(id?`${apiUrl}/api/lessons/${id}/submissions`:null, fetcher)
  const updateQuizMark = async(attemptId,score)=>{
    await fetch(`${apiUrl}/api/lessons/quiz/mark`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({attempt_id:attemptId,score})})
    window.location.reload()
  }
  const updateTaskMark = async(subId,mark)=>{
    await fetch(`${apiUrl}/api/lessons/task/mark`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({submission_id:subId,mark})})
    window.location.reload()
  }
  if(!data) return <Container><Box className="centerLoader"><CircularProgress /></Box></Container>
  return (
    <Container maxWidth="lg">
      <Box sx={{mt:4,mb:4}}>
        <Typography variant="h4" sx={{mb:4}}>Engagement Summary</Typography>
        <TableContainer component={Paper} sx={{mb:4,boxShadow:2}}>
          <Table>
            <TableHead sx={{backgroundColor:'#f5f5f5'}}>
              <TableRow>
                <TableCell><strong>Student</strong></TableCell>
                <TableCell align="center"><strong>Viewed</strong></TableCell>
                <TableCell align="center"><strong>Quiz</strong></TableCell>
                <TableCell align="center"><strong>Task</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map(row=> (
                <TableRow key={row.student.id}>
                  <TableCell>{row.student.name}</TableCell>
                  <TableCell align="center">{row.viewed? <Chip label="Yes" color="primary" size="small" /> : <Chip label="No" size="small" />}</TableCell>
                  <TableCell align="center">{row.quiz? <Chip label={`${row.quiz.score}`} color="success" size="small" /> : '-'}</TableCell>
                  <TableCell align="center">{row.task? <Chip label={row.task.mark!=null? row.task.mark : 'Submitted'} size="small" /> : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Typography variant="h5" sx={{mb:3,mt:4}}>Quiz Attempts</Typography>
        {attempts && attempts.map(a=> (
          <Card key={a.id} sx={{mb:3,boxShadow:2}}>
            <CardContent>
              <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'center',mb:2}}>
                <Box>
                  <Typography variant="subtitle1"><strong>{a.student_name}</strong></Typography>
                  <Typography variant="caption" color="textSecondary">{a.submitted_at}</Typography>
                </Box>
                <Chip label={`Score: ${a.score}`} color="primary" />
              </Box>
              <Divider sx={{my:2}} />
              {a.answers && a.answers.map((ans,idx)=> (
                <Box key={idx} sx={{mb:2,pb:2,borderBottom:'1px solid #eee'}}>
                  <Typography variant="subtitle2" sx={{mb:1}}>{ans.question_text}</Typography>
                  <Box sx={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:2,mb:1,fontSize:'0.9em'}}>
                    <Box><strong>Options:</strong> A: {ans.option_a}, B: {ans.option_b}, C: {ans.option_c}, D: {ans.option_d}</Box>
                    <Box><strong>Student:</strong> {ans.answer}, <strong>Correct:</strong> {ans.correct_option}</Box>
                  </Box>
                </Box>
              ))}
            </CardContent>
            <CardActions>
              <TextField size="small" defaultValue={a.score} id={`score_${a.id}`} type="number" sx={{mr:1}} />
              <Button size="small" variant="contained" startIcon={<EditIcon />} onClick={()=>updateQuizMark(a.id,parseInt(document.getElementById(`score_${a.id}`).value||0))}>Set Score</Button>
            </CardActions>
          </Card>
        ))}
        <Typography variant="h5" sx={{mb:3,mt:4}}>Task Submissions</Typography>
        {subs && subs.map(s=> (
          <Card key={s.id} sx={{mb:3,boxShadow:2}}>
            <CardContent>
              <Box sx={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',mb:2}}>
                <Box sx={{flex:1}}>
                  <Typography variant="subtitle1"><strong>{s.student_name}</strong></Typography>
                  <Typography variant="body2" sx={{mt:1,p:1.5,backgroundColor:'#f5f5f5',borderRadius:1}}>{s.content}</Typography>
                </Box>
              </Box>
            </CardContent>
            <CardActions>
              <TextField size="small" defaultValue={s.mark||''} id={`mark_${s.id}`} type="number" placeholder="Mark" sx={{mr:1}} />
              <Button size="small" variant="contained" startIcon={<EditIcon />} onClick={()=>updateTaskMark(s.id,parseInt(document.getElementById(`mark_${s.id}`).value||0))}>Set Mark</Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Container>
  )
}
