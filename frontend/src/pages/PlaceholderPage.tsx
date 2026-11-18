import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        {title}
      </Typography>
      <Card>
        <CardContent>
          <Typography color="text.secondary">Esta página chega na Fase 6.</Typography>
        </CardContent>
      </Card>
    </>
  )
}