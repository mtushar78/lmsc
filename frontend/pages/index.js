import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Container, Box, Button, Select, MenuItem, FormControl, InputLabel, Card, CardContent, Typography } from '@mui/material'
const fetcher = (url) => fetch(url).then(r => r.json())
export default function Home() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    const { data } = useSWR(`${apiUrl}/api/users`, fetcher)
    const [role, setRole] = useState('student')
    const [userId, setUserId] = useState('')
    useEffect(() => {
        if (data && data.students) setUserId(data.students[0]?.id || '')
    }, [data])
    if (!data) return <Container><Box className="centerLoader"><Typography>Loading...</Typography></Box></Container>
    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Card sx={{ width: '100%', boxShadow: 3 }}>
                    <CardContent>
                        <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>LMSC E-Learning</Typography>
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Role</InputLabel>
                            <Select value={role} label="Role" onChange={(e) => setRole(e.target.value)}>
                                <MenuItem value="student">Student</MenuItem>
                                <MenuItem value="teacher">Teacher</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>User</InputLabel>
                            <Select value={userId} label="User" onChange={(e) => setUserId(e.target.value)}>
                                {(role === 'student' ? data.students : data.teachers).map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <Button variant="contained" fullWidth sx={{ py: 1.5 }} href={`/${role}/lessons?user=${userId}`}>Continue</Button>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    )
}
