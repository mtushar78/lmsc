import useSWR from 'swr'
import {useRouter} from 'next/router'
import { useEffect, useState } from 'react'
import { Container, Box, Card, CardContent, CardActions, Button, Typography, CircularProgress, Chip } from '@mui/material'
const fetcher = (url)=>fetch(url).then(r=>r.json())
export default function Lessons(){
  const router=useRouter()
  const {user} = router.query
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  const {data} = useSWR(`${apiUrl}/api/lessons`,fetcher)
  const [statuses, setStatuses] = useState({})

  useEffect(()=>{
    if(!data || !user) return
    let mounted = true
    Promise.all(data.map(l=> fetch(`${apiUrl}/api/lessons/${l.id}/status?student_id=${user}`).then(r=>r.json()).catch(()=>null))).then(results=>{
      if(!mounted) return
      const map = {}
      data.forEach((l,idx)=> map[l.id] = results[idx])
      setStatuses(map)
    })
    return ()=>{ mounted = false }
  },[data,user])

  if(!data) return <Container><Box className="centerLoader"><CircularProgress /></Box></Container>
  return (
    <Container maxWidth="md">
      <Box sx={{mt:4,mb:4}}>
        <Typography variant="h4" sx={{mb:4}}>Available Lessons</Typography>
        <Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',sm:'1fr 1fr'},gap:3}}>
          {data.map(l=> (
            <Card key={l.id} sx={{display:'flex',flexDirection:'column',boxShadow:2}}>
              <CardContent sx={{flexGrow:1}}>
                <Typography variant="h6">{l.title}</Typography>
                <Typography variant="body2" color="textSecondary" sx={{mt:1}}>{l.description}</Typography>
                {user && statuses[l.id] && (
                  <Box sx={{mt:2,display:'flex',gap:1,flexWrap:'wrap'}}>
                    <Chip label={statuses[l.id].quiz ? `Quiz: ${statuses[l.id].quiz.score}` : 'Quiz: not submitted'} size="small" color={statuses[l.id].quiz ? 'success' : 'default'} />
                    <Chip label={statuses[l.id].task ? (statuses[l.id].task.mark!=null ? `Task mark: ${statuses[l.id].task.mark}` : 'Task: awaiting mark') : 'Task: not submitted'} size="small" color={statuses[l.id].task && statuses[l.id].task.mark!=null ? 'primary' : 'default'} />
                  </Box>
                )}
              </CardContent>
              <CardActions>
                <Button size="small" variant="contained" href={`/student/lesson/${l.id}?user=${user}`}>Open Lesson</Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      </Box>
    </Container>
  )
}
