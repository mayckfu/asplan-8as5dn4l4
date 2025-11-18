import { CheckCircle, ShieldAlert, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pendencia } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

interface EmendaChecklistTabProps {
  pendencias: Pendencia[]
  onPendencyClick: (pendencia: Pendencia) => void
}

export const EmendaChecklistTab = ({
  pendencias,
  onPendencyClick,
}: EmendaChecklistTabProps) => {
  const { user } = useAuth()
  const isReadOnly = user?.role === 'CONSULTA'

  const pendingItems = pendencias.filter((p) => !p.resolvida && !p.dispensada)
  const resolvedItems = pendencias.filter((p) => p.resolvida || p.dispensada)

  return (
    <Card className="rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800">
      <CardHeader>
        <CardTitle className="font-medium text-neutral-900 dark:text-neutral-200">
          Checklist & Pendências
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {pendingItems.length === 0 && resolvedItems.length > 0 && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-green-800 font-medium">
                Todas as etapas do checklist foram concluídas!
              </span>
            </div>
          )}

          {pendingItems.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Pendentes
              </h4>
              <ul className="space-y-2">
                {pendingItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between p-3 border border-destructive/20 bg-destructive/5 rounded-lg"
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer flex-grow hover:text-destructive transition-colors"
                      onClick={() => onPendencyClick(item)}
                    >
                      <ShieldAlert className="h-5 w-5 text-destructive" />
                      <div className="flex flex-col">
                        <span className="text-neutral-800 dark:text-neutral-200 font-medium">
                          {item.descricao}
                        </span>
                        {item.justificativa && (
                          <span className="text-xs text-muted-foreground italic">
                            Justificativa: {item.justificativa}
                          </span>
                        )}
                      </div>
                    </div>
                    {!isReadOnly && (
                      <Button variant="outline" size="sm" className="ml-4">
                        Dispensar
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {resolvedItems.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-success flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> Concluídos
              </h4>
              <ul className="space-y-2">
                {resolvedItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between p-3 border border-success/20 bg-success/5 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-grow">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <div className="flex flex-col">
                        <span
                          className={cn(
                            'text-neutral-600 dark:text-neutral-400',
                            {
                              'line-through text-muted-foreground':
                                item.dispensada && !item.resolvida,
                            },
                          )}
                        >
                          {item.descricao}
                        </span>
                        {item.dispensada && !item.resolvida && (
                          <span className="text-xs text-muted-foreground italic">
                            Dispensada
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
