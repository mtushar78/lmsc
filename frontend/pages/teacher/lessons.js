import useSWR from 'swr'
import {useRouter} from 'next/router'
import { Container, Box, Card, CardContent, CardActions, Button, Typography, CircularProgress } from '@mui/material'
import BarChartIcon from '@mui/icons-material/BarChart'
const fetcher = (url)=>fetch(url).then(r=>r.json())
export default function Lessons(){
  const router=useRouter()
  const {user} = router.query
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  const {data} = useSWR(`${apiUrl}/api/lessons`,fetcher)
  if(!data) return <Container><Box className="centerLoader"><CircularProgress /></Box></Container>
  return (
    <Container maxWidth="md">
      <Box sx={{mt:4,mb:4}}>
        <Typography variant="h4" sx={{mb:4}}>Your Lessons</Typography>
        <Box sx={{display:'grid',gridTemplateColumns:{xs:'1fr',sm:'1fr 1fr'},gap:3}}>
          {data.map(l=> (
            <Card key={l.id} sx={{display:'flex',flexDirection:'column',boxShadow:2}}>
              <CardContent sx={{flexGrow:1}}>
                <Typography variant="h6">{l.title}</Typography>
                <Typography variant="body2" color="textSecondary" sx={{mt:1,mb:2}}>{l.description}</Typography>
                <Box sx={{display:'flex',gap:2,mb:2}}>
                  <Box><Typography variant="caption">Viewed</Typography><Typography variant="h6">{l.viewed_count||0}</Typography></Box>
                  <Box><Typography variant="caption">Quiz Done</Typography><Typography variant="h6">{l.quiz_count||0}</Typography></Box>
                </Box>
              </CardContent>
              <CardActions>
                <Button size="small" variant="contained" startIcon={<BarChartIcon />} href={`/teacher/lesson/${l.id}?user=${user}`}>Engagement</Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      </Box>
    </Container>
  )
}
