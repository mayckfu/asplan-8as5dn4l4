import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const MapaPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-200">
        Mapa da Saúde
      </h1>
      <Card className="rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="font-medium text-neutral-900 dark:text-neutral-200">
            Distribuição Geográfica das UBS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] bg-muted flex items-center justify-center rounded-lg">
            <p className="text-muted-foreground">
              Integração com mapa (Leaflet) a ser implementada aqui.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MapaPage
