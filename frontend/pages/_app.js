import '../styles.css'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
const theme = createTheme({
  palette: { primary: { main: '#1976d2' }, secondary: { main: '#dc004e' } },
  typography: { fontFamily: '"Roboto", sans-serif' }
})
export default function App({Component,pageProps}){
  return <ThemeProvider theme={theme}><CssBaseline /><Component {...pageProps} /></ThemeProvider>
}
