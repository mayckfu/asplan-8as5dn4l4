import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Edit,
  PlusCircle,
  Upload,
  File,
  Download,
  Trash2,
  CheckCircle,
  Circle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { StatusBadge } from '@/components/StatusBadge'
import { amendmentDetails } from '@/lib/mock-data'

const EmendaDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const data = amendmentDetails // In a real app, fetch by id

  const checklistProgress =
    (data.checklist.filter((item) => item.completed).length /
      data.checklist.length) *
    100

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Voltar</span>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          {data.title} - {id}
        </h1>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <Button variant="outline" size="sm">
            Descartar
          </Button>
          <Button size="sm">Salvar</Button>
        </div>
      </div>
      <Tabs defaultValue="resumo">
        <TabsList>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="repasses">Repasses</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
          <TabsTrigger value="anexos">Anexos</TabsTrigger>
          <TabsTrigger value="checklist">Checklist & Pendências</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>
        <TabsContent value="resumo">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Emenda</CardTitle>
              <CardDescription>
                Informações gerais sobre a emenda.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div>
                <strong>ID:</strong> {data.id}
              </div>
              <div>
                <strong>Título:</strong> {data.title}
              </div>
              <div>
                <strong>Status Oficial:</strong>{' '}
                <StatusBadge status={data.officialStatus} />
              </div>
              <div>
                <strong>Status Interno:</strong>{' '}
                <StatusBadge status={data.internalStatus} />
              </div>
              <div>
                <strong>Responsável:</strong> {data.responsible}
              </div>
              <div>
                <strong>Data de Criação:</strong> {data.creationDate}
              </div>
              <div>
                <strong>Valor Total:</strong>{' '}
                {data.totalValue.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </div>
              <div className="md:col-span-2">
                <strong>Descrição:</strong> {data.description}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="repasses">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Repasses Financeiros</CardTitle>
                <Button size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Adicionar Repasse
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.transfers.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{t.id}</TableCell>
                      <TableCell>{t.date}</TableCell>
                      <TableCell>
                        {t.value.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={t.status as any} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="despesas">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Despesas</CardTitle>
                <Button size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Adicionar Despesa
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.expenses.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>{e.id}</TableCell>
                      <TableCell>{e.description}</TableCell>
                      <TableCell>{e.date}</TableCell>
                      <TableCell>
                        {e.value.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={e.status as any} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="anexos">
          <Card>
            <CardHeader>
              <CardTitle>Anexos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Arraste e solte arquivos aqui ou
                </p>
                <Button variant="outline" className="mt-2">
                  Selecione os arquivos
                </Button>
              </div>
              <ul className="space-y-2">
                {data.attachments.map((a) => (
                  <li
                    key={a.name}
                    className="flex items-center justify-between p-2 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <File className="h-6 w-6 text-primary" />
                      <div>
                        <p className="font-medium">{a.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Enviado por {a.uploader} em {a.uploadDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="checklist">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Checklist & Pendências</CardTitle>
                <Button size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              </div>
              <div className="mt-4">
                <Progress value={checklistProgress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-2">
                  {checklistProgress.toFixed(0)}% concluído
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {data.checklist.map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    {item.completed ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span
                      className={cn({
                        'line-through text-muted-foreground': item.completed,
                      })}
                    >
                      {item.description}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="historico">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Alterações</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.history.map((h) => (
                    <TableRow key={h.timestamp}>
                      <TableCell>{h.timestamp}</TableCell>
                      <TableCell>{h.user}</TableCell>
                      <TableCell>{h.action}</TableCell>
                      <TableCell>{h.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EmendaDetailPage
