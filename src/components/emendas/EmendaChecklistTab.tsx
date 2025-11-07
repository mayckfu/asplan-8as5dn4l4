import { CheckCircle, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pendencia } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

interface EmendaChecklistTabProps {
  pendencias: Pendencia[]
}

export const EmendaChecklistTab = ({ pendencias }: EmendaChecklistTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Checklist & Pendências</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {pendencias.length === 0 && (
            <li className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-green-800 font-medium">
                Nenhuma pendência encontrada.
              </span>
            </li>
          )}
          {pendencias.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {item.dispensada ? (
                  <CheckCircle className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ShieldAlert className="h-5 w-5 text-destructive" />
                )}
                <div className="flex flex-col">
                  <span
                    className={cn({
                      'line-through text-muted-foreground': item.dispensada,
                    })}
                  >
                    {item.descricao}
                  </span>
                  {item.justificativa && (
                    <span className="text-xs text-muted-foreground italic">
                      Justificativa: {item.justificativa}
                    </span>
                  )}
                </div>
              </div>
              {!item.dispensada && (
                <Button variant="outline" size="sm">
                  Dispensar
                </Button>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
